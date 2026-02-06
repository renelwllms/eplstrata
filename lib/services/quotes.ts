import type { PrismaClient, QuoteStatus, TaxDiscountMode, TaxMode } from "@prisma/client";
import { tenantScopedPrisma } from "../tenant";
import { calculateTotals } from "../billing";

const QUOTE_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ["SENT"],
  SENT: ["ACCEPTED", "DECLINED"],
  ACCEPTED: [],
  DECLINED: []
};

export function quoteService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);

  return {
    async list(userId: string, role: string) {
      if (role === "STAFF") {
        return prisma.quote.findMany({
          where: {
            job: {
              assignments: { some: { userId } }
            }
          },
          include: { lineItems: true },
          orderBy: { createdAt: "desc" }
        });
      }

      return prisma.quote.findMany({ include: { lineItems: true }, orderBy: { createdAt: "desc" } });
    },
    get(id: string) {
      return prisma.quote.findUnique({ where: { id }, include: { lineItems: true } });
    },
    async create(params: {
      clientId: string;
      jobId?: string;
      templateId?: string;
      number: string;
      status?: QuoteStatus;
      approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
      isMaster?: boolean;
      lineItems: { description: string; quantity: number; rate: number; discountPercent?: number; isOptional?: boolean }[];
      settings: { gstRate: number; taxMode: TaxMode; taxDiscountMode: TaxDiscountMode; currency: string };
    }) {
      const billableItems = params.lineItems.filter((item) => !item.isOptional);
      const totals = calculateTotals({
        items: billableItems,
        gstRate: params.settings.gstRate,
        taxMode: params.settings.taxMode,
        taxDiscountMode: params.settings.taxDiscountMode
      });

      return prisma.quote.create({
        data: {
          tenantId,
          clientId: params.clientId,
          jobId: params.jobId,
          templateId: params.templateId,
          number: params.number,
          status: params.status ?? "DRAFT",
          approvalStatus: params.approvalStatus ?? "PENDING",
          isMaster: params.isMaster ?? false,
          currency: params.settings.currency,
          gstRate: params.settings.gstRate,
          taxMode: params.settings.taxMode,
          taxDiscountMode: params.settings.taxDiscountMode,
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          taxTotal: totals.taxTotal,
          total: totals.total,
          lineItems: {
            create: params.lineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              discountPercent: item.discountPercent ?? 0,
              isOptional: item.isOptional ?? false
            }))
          }
        },
        include: { lineItems: true }
      });
    },
    async update(id: string, params: {
      status?: QuoteStatus;
      approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
      isMaster?: boolean;
      lineItems?: { description: string; quantity: number; rate: number; discountPercent?: number; isOptional?: boolean }[];
      settings?: { gstRate: number; taxMode: TaxMode; taxDiscountMode: TaxDiscountMode; currency: string };
      fields: Record<string, unknown>;
    }) {
      const existing = await prisma.quote.findUnique({ where: { id } });
      if (!existing) {
        return null;
      }

      if (params.status) {
        const allowed = QUOTE_TRANSITIONS[existing.status];
        if (!allowed.includes(params.status)) {
          throw new Error("Invalid quote status transition");
        }
      }

      let totals = null;
      if (params.lineItems && params.settings) {
        const billableItems = params.lineItems.filter((item) => !item.isOptional);
        totals = calculateTotals({
          items: billableItems,
          gstRate: params.settings.gstRate,
          taxMode: params.settings.taxMode,
          taxDiscountMode: params.settings.taxDiscountMode
        });
      }

      return prisma.$transaction(async (tx) => {
        if (params.lineItems) {
          await tx.quoteLineItem.deleteMany({ where: { quoteId: id } });
        }

        return tx.quote.update({
          where: { id },
          data: {
            ...params.fields,
            status: params.status ?? existing.status,
            approvalStatus: params.approvalStatus ?? existing.approvalStatus,
            isMaster: params.isMaster ?? existing.isMaster,
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
                    discountPercent: item.discountPercent ?? 0,
                    isOptional: item.isOptional ?? false
                  }))
                }
              : undefined
          },
          include: { lineItems: true }
        });
      });
    },
    remove(id: string) {
      return prisma.quote.delete({ where: { id } });
    }
  };
}
