import { prisma } from "../../../lib/prisma";
import { jobService } from "../../../lib/services/jobs";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { jobCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";
import { consumeNextNumber } from "../../../lib/numbering";

export async function GET() {
  try {
    const { user } = await requireFeature("JOBS");
    const service = jobService(user.tenantId, prisma);
    const jobs = await service.list(user.id, user.role);
    return jsonOk({ data: jobs });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("JOBS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = jobCreateSchema.parse(body);

    const service = jobService(user.tenantId, prisma);
    const jobNumber = payload.jobNumber ?? (await consumeNextNumber(prisma, user.tenantId, "JOB"));
    const job = await service.create({
      ...payload,
      jobNumber
    });

    if (payload.assigneeIds && payload.assigneeIds.length > 0) {
      await prisma.jobAssignment.createMany({
        data: payload.assigneeIds.map((userId) => ({
          tenantId: user.tenantId,
          jobId: job.id,
          userId
        })),
        skipDuplicates: true
      });
    }

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Job",
      entityId: job.id,
      operation: "CREATE"
    });

    return jsonOk({ data: job }, 201);
  } catch (error) {
    return handleError(error);
  }
}
