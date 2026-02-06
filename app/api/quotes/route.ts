import { prisma } from "../../../lib/prisma";
import { quoteService } from "../../../lib/services/quotes";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { quoteCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";
import { consumeNextNumber } from "../../../lib/numbering";

export async function GET() {
  try {
    const { user } = await requireFeature("QUOTES");
    const service = quoteService(user.tenantId, prisma);
    const quotes = await service.list(user.id, user.role);
    return jsonOk({ data: quotes });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("QUOTES");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = quoteCreateSchema.parse(body);

    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: user.tenantId }
    });

    if (!settings) {
      throw new Error("Tenant settings missing");
    }

    const service = quoteService(user.tenantId, prisma);
    const number = payload.number ?? (await consumeNextNumber(prisma, user.tenantId, "QUOTE"));
    const quote = await service.create({
      ...payload,
      number,
      settings: {
        gstRate: Number(settings.gstRate),
        taxMode: settings.taxMode,
        taxDiscountMode: settings.taxDiscountMode,
        currency: settings.currency
      }
    });

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Quote",
      entityId: quote.id,
      operation: "CREATE"
    });

    return jsonOk({ data: quote }, 201);
  } catch (error) {
    return handleError(error);
  }
}
