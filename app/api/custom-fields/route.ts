import { prisma } from "../../../lib/prisma";
import { customFieldService } from "../../../lib/services/custom-fields";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { customFieldCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

export async function GET(request: Request) {
  try {
    const { user } = await requireFeature("CUSTOM_FIELDS");
    const service = customFieldService(user.tenantId, prisma);
    const url = new URL(request.url);
    const entityType = url.searchParams.get("entityType") ?? undefined;
    const fields = await service.list(entityType as never);
    return jsonOk({ data: fields });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("CUSTOM_FIELDS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = customFieldCreateSchema.parse(body);
    const service = customFieldService(user.tenantId, prisma);
    const created = await service.create(payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "CustomFieldDefinition",
      entityId: created.id,
      operation: "CREATE"
    });

    return jsonOk({ data: created }, 201);
  } catch (error) {
    return handleError(error);
  }
}
