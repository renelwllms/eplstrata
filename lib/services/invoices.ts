import type { InvoiceStatus, PrismaClient, TaxDiscountMode, TaxMode } from "@prisma/client";
import { tenantScopedPrisma } from "../tenant";
import { calculateTotals } from "../billing";

const INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["SENT", "VOID"],
  SENT: ["PAID", "OVERDUE", "VOID"],
  PAID: [],
  OVERDUE: ["PAID", "VOID"],
  VOID: []
};

export function invoiceService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);

  return {
    async list(userId: string, role: string) {
      if (role === "STAFF") {
        return prisma.invoice.findMany({
          where: {
            job: {
              assignments: { some: { userId } }
            }
          },
          include: { lineItems: true, payments: true },
          orderBy: { createdAt: "desc" }
        });
      }

      return prisma.invoice.findMany({
        include: { lineItems: true, payments: true },
        orderBy: { createdAt: "desc" }
      });
    },
    get(id: string) {
      return prisma.invoice.findUnique({ where: { id }, include: { lineItems: true, payments: true } });
    },
    async create(params: {
      clientId: string;
      jobId?: string;
      jobIds?: string[];
      templateId?: string;
      number: string;
      status?: InvoiceStatus;
      billingMode?: "ACTUAL" | "QUOTED" | "PROGRESS" | "PERCENT_QUOTE";
      progressPercent?: number;
      lineItems: { description: string; quantity: number; rate: number; discountPercent?: number }[];
      settings: { gstRate: number; taxMode: TaxMode; taxDiscountMode: TaxDiscountMode; currency: string };
    }) {
      const totals = calculateTotals({
        items: params.lineItems,
        gstRate: params.settings.gstRate,
        taxMode: params.settings.taxMode,
        taxDiscountMode: params.settings.taxDiscountMode
      });

      return prisma.invoice.create({
        data: {
          tenantId,
          clientId: params.clientId,
          jobId: params.jobId,
          templateId: params.templateId,
          number: params.number,
          status: params.status ?? "DRAFT",
          billingMode: params.billingMode ?? "ACTUAL",
          progressPercent: params.progressPercent,
          currency: params.settings.currency,
          gstRate: params.settings.gstRate,
          taxMode: params.settings.taxMode,
          taxDiscountMode: params.settings.taxDiscountMode,
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          taxTotal: totals.taxTotal,
          total: totals.total,
          jobLinks: params.jobIds?.length
            ? {
                create: params.jobIds.map((jobId) => ({
                  tenantId,
                  jobId
                }))
              }
            : undefined,
          lineItems: {
            create: params.lineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              discountPercent: item.discountPercent ?? 0
            }))
          }
        },
        include: { lineItems: true, payments: true, jobLinks: true }
      });
    },
    async update(id: string, params: {
      status?: InvoiceStatus;
      billingMode?: "ACTUAL" | "QUOTED" | "PROGRESS" | "PERCENT_QUOTE";
      progressPercent?: number;
      lineItems?: { description: string; quantity: number; rate: number; discountPercent?: number }[];
      settings?: { gstRate: number; taxMode: TaxMode; taxDiscountMode: TaxDiscountMode; currency: string };
      fields: Record<string, unknown>;
    }) {
      const existing = await prisma.invoice.findUnique({ where: { id } });
      if (!existing) {
        return null;
      }

      if (params.status) {
        const allowed = INVOICE_TRANSITIONS[existing.status];
        if (!allowed.includes(params.status)) {
          throw new Error("Invalid invoice status transition");
        }
      }

      let totals = null;
      if (params.lineItems && params.settings) {
        totals = calculateTotals({
          items: params.lineItems,
          gstRate: params.settings.gstRate,
          taxMode: params.settings.taxMode,
          taxDiscountMode: params.settings.taxDiscountMode
        });
      }

      return prisma.$transaction(async (tx) => {
        if (params.lineItems) {
          await tx.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
        }

        return tx.invoice.update({
          where: { id },
          data: {
            ...params.fields,
            status: params.status ?? existing.status,
            billingMode: params.billingMode ?? existing.billingMode,
            progressPercent: params.progressPercent ?? existing.progressPercent,
            currency: params.settings?.currency ?? existing.currency,
            gstRate: params.settings?.gstRate ?? existing.gstRate,
            taxMode: params.settings?.taxMode ?? existing.taxMode,
            taxDiscountMode: params.settings?.taxDiscountMode ?? existing.taxDiscountMode,
            subtotal: totals?.subtotal ?? existing.subtotal,
            discountTotal: totals?.discountTotal ?? existing.discountTotal,
            taxTotal: totals?.taxTotal ?? existing.taxTotal,
            total: totals?.total ?? existing.total,
            lineItems: params.lineItems
              ? {
                  create: params.lineItems.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    rate: item.rate,
                    discountPercent: item.discountPercent ?? 0
                  }))
                }
              : undefined
          },
          include: { lineItems: true, payments: true, jobLinks: true }
        });
      });
    },
    remove(id: string) {
      return prisma.invoice.delete({ where: { id } });
    }
  };
}
