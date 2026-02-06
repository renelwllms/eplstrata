import { prisma } from "../../../../../lib/prisma";
import { jobRecurrenceService } from "../../../../../lib/services/job-recurrence";
import { requireFeature, requireWriteAccess } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { jobRecurrenceCreateSchema, jobRecurrenceUpdateSchema } from "../../../../../lib/validators";
import { auditCrudStub } from "../../../../../lib/audit";
import { assertJobAccess } from "../../../../../lib/job-access";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("JOBS");
    await assertJobAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      jobId: params.id
    });

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { recurrenceRuleId: true }
    });

    if (!job?.recurrenceRuleId) {
      return jsonOk({ data: null });
    }

    const service = jobRecurrenceService(user.tenantId, prisma);
    const rule = await service.get(job.recurrenceRuleId);
    return jsonOk({ data: rule });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("JOBS");
    await assertJobAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      jobId: params.id
    });
    const body = await request.json();
    const payload = jobRecurrenceCreateSchema.parse(body);
    const service = jobRecurrenceService(user.tenantId, prisma);
    const rule = await service.create(payload);

    await prisma.job.update({
      where: { id: params.id },
      data: { recurrenceRuleId: rule.id }
    });

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "JobRecurrenceRule",
      entityId: rule.id,
      operation: "CREATE"
    });

    return jsonOk({ data: rule }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("JOBS");
    await assertJobAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      jobId: params.id
    });
    const body = await request.json();
    const payload = jobRecurrenceUpdateSchema.parse(body);
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { recurrenceRuleId: true }
    });

    if (!job?.recurrenceRuleId) {
      throw new Error("Recurrence rule not found");
    }

    const service = jobRecurrenceService(user.tenantId, prisma);
    const rule = await service.update(job.recurrenceRuleId, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "JobRecurrenceRule",
      entityId: rule.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: rule });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("JOBS");
    await assertJobAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      jobId: params.id
    });

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { recurrenceRuleId: true }
    });

    if (!job?.recurrenceRuleId) {
      return jsonOk({ data: null });
    }

    const service = jobRecurrenceService(user.tenantId, prisma);
    const rule = await service.remove(job.recurrenceRuleId);

    await prisma.job.update({
      where: { id: params.id },
      data: { recurrenceRuleId: null }
    });

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "JobRecurrenceRule",
      entityId: rule.id,
      operation: "DELETE"
    });

    return jsonOk({ data: rule });
  } catch (error) {
    return handleError(error);
  }
}
