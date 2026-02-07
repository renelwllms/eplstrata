import { prisma } from "../../../../../../lib/prisma";
import { leadActivityService } from "../../../../../../lib/services/leads";
import { requireFeature, requireWriteAccess } from "../../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../../lib/api";
import { leadActivityUpdateSchema } from "../../../../../../lib/validators";
import { auditCrudStub } from "../../../../../../lib/audit";
import { assertLeadAccess } from "../../../../../../lib/lead-access";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {  const { id, activityId } = await params;
  try {
    const { user } = await requireWriteAccess("LEADS");
    await assertLeadAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      leadId: id
    });
    const body = await request.json();
    const payload = leadActivityUpdateSchema.parse(body);
    const service = leadActivityService(user.tenantId, prisma);
    const activity = await service.update(activityId, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "LeadActivity",
      entityId: activity.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: activity });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {  const { id, activityId } = await params;
  try {
    const { user } = await requireWriteAccess("LEADS");
    await assertLeadAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      leadId: id
    });
    const service = leadActivityService(user.tenantId, prisma);
    const activity = await service.remove(activityId);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "LeadActivity",
      entityId: activity.id,
      operation: "DELETE"
    });

    return jsonOk({ data: activity });
  } catch (error) {
    return handleError(error);
  }
}
