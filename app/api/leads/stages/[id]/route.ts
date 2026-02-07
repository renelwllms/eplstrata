import { prisma } from "../../../../../lib/prisma";
import { leadStageService } from "../../../../../lib/services/leads";
import { requireFeature, requireWriteAccess } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { leadStageUpdateSchema } from "../../../../../lib/validators";
import { auditCrudStub } from "../../../../../lib/audit";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireFeature("LEADS");
    const service = leadStageService(user.tenantId, prisma);
    const stage = await service.get(id);
    return jsonOk({ data: stage });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("LEADS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = leadStageUpdateSchema.parse(body);
    const service = leadStageService(user.tenantId, prisma);
    const stage = await service.update(id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "LeadStage",
      entityId: stage.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: stage });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("LEADS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = leadStageService(user.tenantId, prisma);
    const stage = await service.remove(id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "LeadStage",
      entityId: stage.id,
      operation: "DELETE"
    });

    return jsonOk({ data: stage });
  } catch (error) {
    return handleError(error);
  }
}
