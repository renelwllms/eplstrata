import { prisma } from "../../../lib/prisma";
import { quoteTemplateService } from "../../../lib/services/quote-templates";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { quoteTemplateCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

export async function GET() {
  try {
    const { user } = await requireFeature("QUOTES_ENHANCED");
    const service = quoteTemplateService(user.tenantId, prisma);
    const templates = await service.list();
    return jsonOk({ data: templates });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("QUOTES_ENHANCED");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = quoteTemplateCreateSchema.parse(body);
    const service = quoteTemplateService(user.tenantId, prisma);
    const template = await service.create(payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "QuoteTemplate",
      entityId: template.id,
      operation: "CREATE"
    });

    return jsonOk({ data: template }, 201);
  } catch (error) {
    return handleError(error);
  }
}
