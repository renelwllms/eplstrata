import { prisma } from "../../../../../../lib/prisma";
import { phaseService } from "../../../../../../lib/services/phases";
import { requireFeature, requireWriteAccess } from "../../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../../lib/api";
import { phaseUpdateSchema } from "../../../../../../lib/validators";
import { auditCrudStub } from "../../../../../../lib/audit";
import { assertJobAccess } from "../../../../../../lib/job-access";

export async function GET(
  _: Request,
  { params }: { params: { id: string; phaseId: string } }
) {
  try {
    const { user } = await requireFeature("JOBS");
    const service = phaseService(user.tenantId, prisma);
    const phase = await service.get(params.phaseId);

    if (phase && user.role === "STAFF") {
      await assertJobAccess({
        tenantId: user.tenantId,
        userId: user.id,
        role: user.role,
        jobId: params.id
      });
    }

    return jsonOk({ data: phase });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; phaseId: string } }
) {
  try {
    const { user } = await requireWriteAccess("JOBS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = phaseUpdateSchema.parse(body);

    const service = phaseService(user.tenantId, prisma);
    const phase = await service.update(params.phaseId, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Phase",
      entityId: phase.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: phase });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string; phaseId: string } }
) {
  try {
    const { user } = await requireWriteAccess("JOBS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = phaseService(user.tenantId, prisma);
    const phase = await service.remove(params.phaseId);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Phase",
      entityId: phase.id,
      operation: "DELETE"
    });

    return jsonOk({ data: phase });
  } catch (error) {
    return handleError(error);
  }
}
