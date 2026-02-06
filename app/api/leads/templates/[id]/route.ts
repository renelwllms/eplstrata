import { prisma } from "../../../../../lib/prisma";
import { leadTemplateService } from "../../../../../lib/services/leads";
import { requireFeature, requireWriteAccess } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { leadTemplateUpdateSchema } from "../../../../../lib/validators";
import { auditCrudStub } from "../../../../../lib/audit";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("LEADS");
    const service = leadTemplateService(user.tenantId, prisma);
    const template = await service.get(params.id);
    return jsonOk({ data: template });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("LEADS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = leadTemplateUpdateSchema.parse(body);
    const service = leadTemplateService(user.tenantId, prisma);
    const template = await service.update(params.id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "LeadTemplate",
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
    const { user } = await requireWriteAccess("LEADS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = leadTemplateService(user.tenantId, prisma);
    const template = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "LeadTemplate",
      entityId: template.id,
      operation: "DELETE"
    });

    return jsonOk({ data: template });
  } catch (error) {
    return handleError(error);
  }
}
