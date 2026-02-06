import { prisma } from "../../../../lib/prisma";
import { jobStageService } from "../../../../lib/services/job-stages";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { jobStageUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("CUSTOMISATION");
    const service = jobStageService(user.tenantId, prisma);
    const stage = await service.get(params.id);
    return jsonOk({ data: stage });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("CUSTOMISATION");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = jobStageUpdateSchema.parse(body);
    const service = jobStageService(user.tenantId, prisma);
    const stage = await service.update(params.id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "JobStage",
      entityId: stage.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: stage });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("CUSTOMISATION");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = jobStageService(user.tenantId, prisma);
    const stage = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "JobStage",
      entityId: stage.id,
      operation: "DELETE"
    });

    return jsonOk({ data: stage });
  } catch (error) {
    return handleError(error);
  }
}
