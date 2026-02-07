import { prisma } from "../../../../../lib/prisma";
import { leadActivityService } from "../../../../../lib/services/leads";
import { requireFeature, requireWriteAccess } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { leadActivityCreateSchema } from "../../../../../lib/validators";
import { auditCrudStub } from "../../../../../lib/audit";
import { assertLeadAccess } from "../../../../../lib/lead-access";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireFeature("LEADS");
    await assertLeadAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      leadId: id
    });
    const service = leadActivityService(user.tenantId, prisma);
    const activities = await service.list(id);
    return jsonOk({ data: activities });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("LEADS");
    await assertLeadAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      leadId: id
    });
    const body = await request.json();
    const payload = leadActivityCreateSchema.parse(body);
    const service = leadActivityService(user.tenantId, prisma);
    const activity = await service.create(id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "LeadActivity",
      entityId: activity.id,
      operation: "CREATE"
    });

    return jsonOk({ data: activity }, 201);
  } catch (error) {
    return handleError(error);
  }
}
