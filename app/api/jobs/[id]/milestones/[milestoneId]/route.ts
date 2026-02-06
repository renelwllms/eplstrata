import { prisma } from "../../../../../../lib/prisma";
import { jobMilestoneService } from "../../../../../../lib/services/job-milestones";
import { requireFeature, requireWriteAccess } from "../../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../../lib/api";
import { jobMilestoneUpdateSchema } from "../../../../../../lib/validators";
import { auditCrudStub } from "../../../../../../lib/audit";
import { assertJobAccess } from "../../../../../../lib/job-access";

export async function PUT(
  request: Request,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const { user } = await requireWriteAccess("JOBS");
    await assertJobAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      jobId: params.id
    });
    const body = await request.json();
    const payload = jobMilestoneUpdateSchema.parse(body);
    const service = jobMilestoneService(user.tenantId, prisma);
    const milestone = await service.update(params.milestoneId, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "JobMilestone",
      entityId: milestone.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: milestone });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const { user } = await requireWriteAccess("JOBS");
    await assertJobAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      jobId: params.id
    });
    const service = jobMilestoneService(user.tenantId, prisma);
    const milestone = await service.remove(params.milestoneId);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "JobMilestone",
      entityId: milestone.id,
      operation: "DELETE"
    });

    return jsonOk({ data: milestone });
  } catch (error) {
    return handleError(error);
  }
}
