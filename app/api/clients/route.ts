import { prisma } from "../../../lib/prisma";
import { clientService } from "../../../lib/services/clients";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { clientCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

export async function GET() {
  try {
    const { user } = await requireFeature("CLIENTS");
    const service = clientService(user.tenantId, prisma);
    const clients = await service.list();
    return jsonOk({ data: clients });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("CLIENTS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = clientCreateSchema.parse(body);

    const service = clientService(user.tenantId, prisma);
    const client = await service.create(payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Client",
      entityId: client.id,
      operation: "CREATE"
    });

    return jsonOk({ data: client }, 201);
  } catch (error) {
    return handleError(error);
  }
}
