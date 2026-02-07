import { prisma } from "../../../../../lib/prisma";
import { phaseService } from "../../../../../lib/services/phases";
import { requireFeature, requireWriteAccess } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { phaseCreateSchema } from "../../../../../lib/validators";
import { auditCrudStub } from "../../../../../lib/audit";
import { assertJobAccess } from "../../../../../lib/job-access";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireFeature("JOBS");
    const service = phaseService(user.tenantId, prisma);
    const phases = await service.list(id);

    if (user.role === "STAFF") {
      await assertJobAccess({
        tenantId: user.tenantId,
        userId: user.id,
        role: user.role,
        jobId: id
      });
    }

    return jsonOk({ data: phases });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("JOBS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = phaseCreateSchema.parse(body);

    const service = phaseService(user.tenantId, prisma);
    const phase = await service.create(id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Phase",
      entityId: phase.id,
      operation: "CREATE"
    });

    return jsonOk({ data: phase }, 201);
  } catch (error) {
    return handleError(error);
  }
}
