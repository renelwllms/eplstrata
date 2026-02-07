import { prisma } from "../../../../../lib/prisma";
import { jobMilestoneService } from "../../../../../lib/services/job-milestones";
import { requireFeature, requireWriteAccess } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { jobMilestoneCreateSchema } from "../../../../../lib/validators";
import { auditCrudStub } from "../../../../../lib/audit";
import { assertJobAccess } from "../../../../../lib/job-access";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireFeature("JOBS");
    await assertJobAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      jobId: id
    });
    const service = jobMilestoneService(user.tenantId, prisma);
    const milestones = await service.list(id);
    return jsonOk({ data: milestones });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("JOBS");
    await assertJobAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      jobId: id
    });
    const body = await request.json();
    const payload = jobMilestoneCreateSchema.parse(body);
    const service = jobMilestoneService(user.tenantId, prisma);
    const milestone = await service.create(id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "JobMilestone",
      entityId: milestone.id,
      operation: "CREATE"
    });

    return jsonOk({ data: milestone }, 201);
  } catch (error) {
    return handleError(error);
  }
}
