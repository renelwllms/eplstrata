import { prisma } from "../../../../lib/prisma";
import { leadStageService } from "../../../../lib/services/leads";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { leadStageCreateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";

export async function GET() {
  try {
    const { user } = await requireFeature("LEADS");
    const service = leadStageService(user.tenantId, prisma);
    const stages = await service.list();
    return jsonOk({ data: stages });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("LEADS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = leadStageCreateSchema.parse(body);
    const service = leadStageService(user.tenantId, prisma);
    const stage = await service.create(payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "LeadStage",
      entityId: stage.id,
      operation: "CREATE"
    });

    return jsonOk({ data: stage }, 201);
  } catch (error) {
    return handleError(error);
  }
}
