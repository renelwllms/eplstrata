import { prisma } from "../../../../lib/prisma";
import { invoiceTemplateService } from "../../../../lib/services/invoice-templates";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { invoiceTemplateUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireFeature("INVOICES_ENHANCED");
    const service = invoiceTemplateService(user.tenantId, prisma);
    const template = await service.get(id);
    return jsonOk({ data: template });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("INVOICES_ENHANCED");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = invoiceTemplateUpdateSchema.parse(body);
    const service = invoiceTemplateService(user.tenantId, prisma);
    const template = await service.update(id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "InvoiceTemplate",
      entityId: template.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: template });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("INVOICES_ENHANCED");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = invoiceTemplateService(user.tenantId, prisma);
    const template = await service.remove(id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "InvoiceTemplate",
      entityId: template.id,
      operation: "DELETE"
    });

    return jsonOk({ data: template });
  } catch (error) {
    return handleError(error);
  }
}
