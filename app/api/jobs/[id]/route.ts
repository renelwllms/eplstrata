import { prisma } from "../../../../lib/prisma";
import { jobService } from "../../../../lib/services/jobs";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { jobUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";
import { assertJobAccess } from "../../../../lib/job-access";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireFeature("JOBS");
    const service = jobService(user.tenantId, prisma);
    const job = await service.get(id);

    if (job && user.role === "STAFF") {
      await assertJobAccess({
        tenantId: user.tenantId,
        userId: user.id,
        role: user.role,
        jobId: id
      });
    }

    return jsonOk({ data: job });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("JOBS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = jobUpdateSchema.parse(body);
    const { jobNumber, assigneeIds, ...rest } = payload;

    const service = jobService(user.tenantId, prisma);
    const job = await service.update(id, rest);

    if (assigneeIds) {
      await prisma.$transaction([
        prisma.jobAssignment.deleteMany({
          where: { tenantId: user.tenantId, jobId: job.id }
        }),
        prisma.jobAssignment.createMany({
          data: assigneeIds.map((userId) => ({
            tenantId: user.tenantId,
            jobId: job.id,
            userId
          })),
          skipDuplicates: true
        })
      ]);
    }

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Job",
      entityId: job.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: job });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("JOBS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = jobService(user.tenantId, prisma);
    const job = await service.remove(id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Job",
      entityId: job.id,
      operation: "DELETE"
    });

    return jsonOk({ data: job });
  } catch (error) {
    return handleError(error);
  }
}
