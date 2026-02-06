import { prisma } from "../../../../lib/prisma";
import { costService } from "../../../../lib/services/costs";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { costUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";
import { assertJobAccess } from "../../../../lib/job-access";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("COSTS");
    const service = costService(user.tenantId, prisma);
    const cost = await service.get(params.id);

    if (cost && user.role === "STAFF") {
      await assertJobAccess({
        tenantId: user.tenantId,
        userId: user.id,
        role: user.role,
        jobId: cost.jobId
      });
    }

    return jsonOk({ data: cost });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("COSTS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = costUpdateSchema.parse(body);

    const service = costService(user.tenantId, prisma);
    const cost = await service.update(params.id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "CostEntry",
      entityId: cost.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: cost });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("COSTS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = costService(user.tenantId, prisma);
    const cost = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "CostEntry",
      entityId: cost.id,
      operation: "DELETE"
    });

    return jsonOk({ data: cost });
  } catch (error) {
    return handleError(error);
  }
}
