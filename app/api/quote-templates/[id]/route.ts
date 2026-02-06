import { prisma } from "../../../../lib/prisma";
import { quoteTemplateService } from "../../../../lib/services/quote-templates";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { quoteTemplateUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("QUOTES_ENHANCED");
    const service = quoteTemplateService(user.tenantId, prisma);
    const template = await service.get(params.id);
    return jsonOk({ data: template });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("QUOTES_ENHANCED");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = quoteTemplateUpdateSchema.parse(body);
    const service = quoteTemplateService(user.tenantId, prisma);
    const template = await service.update(params.id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "QuoteTemplate",
      entityId: template.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: template });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("QUOTES_ENHANCED");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = quoteTemplateService(user.tenantId, prisma);
    const template = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "QuoteTemplate",
      entityId: template.id,
      operation: "DELETE"
    });

    return jsonOk({ data: template });
  } catch (error) {
    return handleError(error);
  }
}
