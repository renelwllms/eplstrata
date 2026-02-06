import { prisma } from "../../../lib/prisma";
import { timeEntryService } from "../../../lib/services/time-entries";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { timeEntryCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

export async function GET() {
  try {
    const { user } = await requireFeature("TIME");
    const service = timeEntryService(user.tenantId, prisma);
    const entries = await service.list(user.id, user.role);
    return jsonOk({ data: entries });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("TIME");
    const body = await request.json();
    const payload = timeEntryCreateSchema.parse(body);

    const service = timeEntryService(user.tenantId, prisma);

    const entry = await service.create({
      ...payload,
      userId: user.role === "STAFF" ? user.id : payload.userId ?? user.id
    });

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "TimeEntry",
      entityId: entry.id,
      operation: "CREATE"
    });

    return jsonOk({ data: entry }, 201);
  } catch (error) {
    return handleError(error);
  }
}
