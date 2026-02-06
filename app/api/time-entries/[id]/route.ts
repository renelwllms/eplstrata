import { prisma } from "../../../../lib/prisma";
import { timeEntryService } from "../../../../lib/services/time-entries";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { timeEntryUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("TIME");
    const service = timeEntryService(user.tenantId, prisma);
    const entry = await service.get(params.id);

    if (entry && user.role === "STAFF" && entry.userId !== user.id) {
      throw new Error("Forbidden");
    }

    return jsonOk({ data: entry });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("TIME");
    const body = await request.json();
    const payload = timeEntryUpdateSchema.parse(body);

    const service = timeEntryService(user.tenantId, prisma);
    const existing = await service.get(params.id);

    if (existing && user.role === "STAFF" && existing.userId !== user.id) {
      throw new Error("Forbidden");
    }
    if (existing?.isLocked) {
      throw new Error("Timesheet submitted");
    }

    const entry = await service.update(params.id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "TimeEntry",
      entityId: entry.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: entry });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("TIME");
    const service = timeEntryService(user.tenantId, prisma);
    const existing = await service.get(params.id);

    if (existing && user.role === "STAFF" && existing.userId !== user.id) {
      throw new Error("Forbidden");
    }
    if (existing?.isLocked) {
      throw new Error("Timesheet submitted");
    }

    const entry = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "TimeEntry",
      entityId: entry.id,
      operation: "DELETE"
    });

    return jsonOk({ data: entry });
  } catch (error) {
    return handleError(error);
  }
}
