import { prisma } from "../../../lib/prisma";
import { taskService } from "../../../lib/services/tasks";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { taskCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

export async function GET() {
  try {
    const { user } = await requireFeature("TASKS");
    const service = taskService(user.tenantId, prisma);
    const tasks = await service.list();
    return jsonOk({ data: tasks });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("TASKS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = taskCreateSchema.parse(body);

    const service = taskService(user.tenantId, prisma);
    const task = await service.create(payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "TaskCatalog",
      entityId: task.id,
      operation: "CREATE"
    });

    return jsonOk({ data: task }, 201);
  } catch (error) {
    return handleError(error);
  }
}
