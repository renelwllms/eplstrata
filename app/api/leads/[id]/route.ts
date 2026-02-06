import { prisma } from "../../../../lib/prisma";
import { leadService } from "../../../../lib/services/leads";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { leadUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";
import { assertLeadAccess } from "../../../../lib/lead-access";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("LEADS");
    await assertLeadAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      leadId: params.id
    });
    const service = leadService(user.tenantId, prisma);
    const lead = await service.get(params.id);
    return jsonOk({ data: lead });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("LEADS");
    await assertLeadAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      leadId: params.id
    });
    const body = await request.json();
    const payload = leadUpdateSchema.parse(body);
    const service = leadService(user.tenantId, prisma);
    const lead = await service.update(params.id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Lead",
      entityId: lead.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: lead });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("LEADS");
    await assertLeadAccess({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      leadId: params.id
    });
    const service = leadService(user.tenantId, prisma);
    const lead = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Lead",
      entityId: lead.id,
      operation: "DELETE"
    });

    return jsonOk({ data: lead });
  } catch (error) {
    return handleError(error);
  }
}
