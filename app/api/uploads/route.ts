import { prisma } from "../../../lib/prisma";
import { uploadService } from "../../../lib/services/uploads";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { uploadCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

function decodeBase64Payload(contentBase64: string) {
  if (contentBase64.startsWith("data:")) {
    const [, base64] = contentBase64.split(",", 2);
    if (!base64) {
      throw new Error("Invalid data URL payload");
    }
    return Buffer.from(base64, "base64");
  }
  return Buffer.from(contentBase64, "base64");
}

async function parseUploadRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new Error("Missing file");
    }
    const filename = typeof formData.get("filename") === "string"
      ? String(formData.get("filename"))
      : file.name;
    const mimeType = file.type || "application/octet-stream";
    const buffer = Buffer.from(await file.arrayBuffer());
    const provider = typeof formData.get("provider") === "string"
      ? String(formData.get("provider"))
      : undefined;
    return { filename, mimeType, buffer, provider };
  }

  const body = await request.json();
  const payload = uploadCreateSchema.parse(body);
  const buffer = decodeBase64Payload(payload.contentBase64);
  return {
    filename: payload.filename,
    mimeType: payload.mimeType,
    buffer,
    provider: payload.provider
  };
}

export async function GET() {
  try {
    const { user } = await requireFeature("UPLOADS");
    const service = uploadService(user.tenantId, prisma);
    const uploads = await service.list();
    return jsonOk({ data: uploads });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("UPLOADS");
    const payload = await parseUploadRequest(request);
    const provider = payload.provider === "LOCAL" ? "LOCAL" : "LOCAL";
    const service = uploadService(user.tenantId, prisma);
    const created = await service.create({
      userId: user.id,
      filename: payload.filename,
      mimeType: payload.mimeType,
      buffer: payload.buffer,
      provider
    });

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Upload",
      entityId: created.id,
      operation: "CREATE"
    });

    return jsonOk({ data: created }, 201);
  } catch (error) {
    return handleError(error);
  }
}
