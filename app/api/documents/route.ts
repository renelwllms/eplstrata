import { prisma } from "../../../lib/prisma";
import { documentService } from "../../../lib/services/documents";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { documentCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function GET(request: Request) {
  try {
    const { user } = await requireFeature("DOCUMENTS");
    const url = new URL(request.url);
    const entityType = url.searchParams.get("entityType") ?? undefined;
    const entityId = url.searchParams.get("entityId") ?? undefined;
    const service = documentService(user.tenantId, prisma);
    const docs = await service.list({
      entityType: entityType as never,
      entityId: entityId ?? undefined
    });
    return jsonOk({ data: docs });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("DOCUMENTS");
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("multipart/form-data")) {
      throw new Error("Multipart upload required");
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new Error("Missing file");
    }

    const payload = documentCreateSchema.parse({
      title: getTextValue(formData, "title") || file.name,
      description: getTextValue(formData, "description") || undefined,
      entityType: getTextValue(formData, "entityType"),
      entityId: getTextValue(formData, "entityId"),
      provider: getTextValue(formData, "provider") || undefined
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const service = documentService(user.tenantId, prisma);
    const document = await service.create({
      createdByUserId: user.id,
      title: payload.title,
      description: payload.description,
      entityType: payload.entityType,
      entityId: payload.entityId,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      buffer,
      provider: payload.provider ?? "LOCAL"
    });

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Document",
      entityId: document.id,
      operation: "CREATE"
    });

    return jsonOk({ data: document }, 201);
  } catch (error) {
    return handleError(error);
  }
}
