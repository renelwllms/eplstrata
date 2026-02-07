import { prisma } from "../../../../../lib/prisma";
import { invoiceService } from "../../../../../lib/services/invoices";
import { requireWriteAccess } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { consumeNextNumber } from "../../../../../lib/numbering";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("INVOICES");
    const invoice = await prisma.invoice.findUnique({
      where: { id: id },
      include: { lineItems: true }
    });

    if (!invoice || invoice.tenantId !== user.tenantId) {
      throw new Error("Invoice not found");
    }

    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: user.tenantId }
    });
    if (!settings) {
      throw new Error("Tenant settings missing");
    }

    const jobLinks = await prisma.invoiceJobLink.findMany({
      where: { tenantId: user.tenantId, invoiceId: invoice.id },
      select: { jobId: true }
    });

    const number = await consumeNextNumber(prisma, user.tenantId, "INVOICE");
    const service = invoiceService(user.tenantId, prisma);
    const duplicated = await service.create({
      clientId: invoice.clientId,
      jobId: invoice.jobId ?? undefined,
      jobIds: jobLinks.map((link) => link.jobId),
      templateId: invoice.templateId ?? undefined,
      number,
      status: "DRAFT",
      billingMode: invoice.billingMode,
      progressPercent: invoice.progressPercent ?? undefined,
      lineItems: invoice.lineItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discountPercent: Number(item.discountPercent)
      })),
      settings: {
        gstRate: Number(settings.gstRate),
        taxMode: settings.taxMode,
        taxDiscountMode: settings.taxDiscountMode,
        currency: settings.currency
      }
    });

    return jsonOk({ data: duplicated }, 201);
  } catch (error) {
    return handleError(error);
  }
}
