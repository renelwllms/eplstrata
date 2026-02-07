import { prisma } from "../../../../lib/prisma";
import { clientService } from "../../../../lib/services/clients";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { clientUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireFeature("CLIENTS");
    const service = clientService(user.tenantId, prisma);
    const client = await service.get(id);
    return jsonOk({ data: client });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("CLIENTS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = clientUpdateSchema.parse(body);

    const service = clientService(user.tenantId, prisma);
    const client = await service.update(id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Client",
      entityId: client.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: client });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("CLIENTS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = clientService(user.tenantId, prisma);
    const client = await service.remove(id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Client",
      entityId: client.id,
      operation: "DELETE"
    });

    return jsonOk({ data: client });
  } catch (error) {
    return handleError(error);
  }
}
