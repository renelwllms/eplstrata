import { prisma } from "../../../../lib/prisma";
import { documentService } from "../../../../lib/services/documents";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { auditCrudStub } from "../../../../lib/audit";
import { documentUpdateSchema } from "../../../../lib/validators";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("DOCUMENTS");
    const service = documentService(user.tenantId, prisma);
    const doc = await service.get(params.id);
    return jsonOk({ data: doc });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("DOCUMENTS");
    const service = documentService(user.tenantId, prisma);
    const doc = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Document",
      entityId: doc.id,
      operation: "DELETE"
    });

    return jsonOk({ data: doc });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("DOCUMENTS");
    const body = await request.json();
    const payload = documentUpdateSchema.parse(body);
    const doc = await prisma.document.update({
      where: { id: params.id },
      data: payload
    });

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Document",
      entityId: doc.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: doc });
  } catch (error) {
    return handleError(error);
  }
}
