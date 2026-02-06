import { prisma } from "../../../lib/prisma";
import { jobStageService } from "../../../lib/services/job-stages";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { jobStageCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

export async function GET() {
  try {
    const { user } = await requireFeature("CUSTOMISATION");
    const service = jobStageService(user.tenantId, prisma);
    const stages = await service.list();
    return jsonOk({ data: stages });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("CUSTOMISATION");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = jobStageCreateSchema.parse(body);
    const service = jobStageService(user.tenantId, prisma);
    const stage = await service.create(payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "JobStage",
      entityId: stage.id,
      operation: "CREATE"
    });

    return jsonOk({ data: stage }, 201);
  } catch (error) {
    return handleError(error);
  }
}
