import { prisma } from "../../../../lib/prisma";
import { customFieldService } from "../../../../lib/services/custom-fields";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { customFieldUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("CUSTOM_FIELDS");
    const service = customFieldService(user.tenantId, prisma);
    const field = await service.get(params.id);
    return jsonOk({ data: field });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("CUSTOM_FIELDS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = customFieldUpdateSchema.parse(body);
    const service = customFieldService(user.tenantId, prisma);
    const updated = await service.update(params.id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "CustomFieldDefinition",
      entityId: updated.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: updated });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("CUSTOM_FIELDS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = customFieldService(user.tenantId, prisma);
    const removed = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "CustomFieldDefinition",
      entityId: removed.id,
      operation: "DELETE"
    });

    return jsonOk({ data: removed });
  } catch (error) {
    return handleError(error);
  }
}
