import { prisma } from "../../../lib/prisma";
import { costService } from "../../../lib/services/costs";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { costCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

export async function GET() {
  try {
    const { user } = await requireFeature("COSTS");
    const service = costService(user.tenantId, prisma);
    const costs = await service.list(user.id, user.role);
    return jsonOk({ data: costs });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("COSTS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = costCreateSchema.parse(body);

    const service = costService(user.tenantId, prisma);
    const cost = await service.create(payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "CostEntry",
      entityId: cost.id,
      operation: "CREATE"
    });

    return jsonOk({ data: cost }, 201);
  } catch (error) {
    return handleError(error);
  }
}
