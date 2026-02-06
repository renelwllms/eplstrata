import { prisma } from "../../../lib/prisma";
import { leadService } from "../../../lib/services/leads";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { leadCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

export async function GET() {
  try {
    const { user } = await requireFeature("LEADS");
    const service = leadService(user.tenantId, prisma);
    const leads = await service.list(user.id, user.role);
    return jsonOk({ data: leads });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("LEADS");
    const body = await request.json();
    const payload = leadCreateSchema.parse(body);
    const service = leadService(user.tenantId, prisma);
    const lead = await service.create(payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Lead",
      entityId: lead.id,
      operation: "CREATE"
    });

    return jsonOk({ data: lead }, 201);
  } catch (error) {
    return handleError(error);
  }
}
