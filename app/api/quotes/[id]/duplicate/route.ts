import { prisma } from "../../../../../lib/prisma";
import { quoteService } from "../../../../../lib/services/quotes";
import { requireWriteAccess } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { consumeNextNumber } from "../../../../../lib/numbering";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("QUOTES");
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: { lineItems: true }
    });

    if (!quote || quote.tenantId !== user.tenantId) {
      throw new Error("Quote not found");
    }

    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: user.tenantId }
    });
    if (!settings) {
      throw new Error("Tenant settings missing");
    }

    const number = await consumeNextNumber(prisma, user.tenantId, "QUOTE");
    const service = quoteService(user.tenantId, prisma);
    const duplicated = await service.create({
      clientId: quote.clientId,
      jobId: quote.jobId ?? undefined,
      templateId: quote.templateId ?? undefined,
      number,
      status: "DRAFT",
      approvalStatus: "PENDING",
      isMaster: false,
      lineItems: quote.lineItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discountPercent: Number(item.discountPercent),
        isOptional: item.isOptional
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
