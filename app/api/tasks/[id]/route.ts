import { prisma } from "../../../../lib/prisma";
import { taskService } from "../../../../lib/services/tasks";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { taskUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("TASKS");
    const service = taskService(user.tenantId, prisma);
    const task = await service.get(params.id);
    return jsonOk({ data: task });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("TASKS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = taskUpdateSchema.parse(body);

    const service = taskService(user.tenantId, prisma);
    const task = await service.update(params.id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "TaskCatalog",
      entityId: task.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: task });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("TASKS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = taskService(user.tenantId, prisma);
    const task = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "TaskCatalog",
      entityId: task.id,
      operation: "DELETE"
    });

    return jsonOk({ data: task });
  } catch (error) {
    return handleError(error);
  }
}
