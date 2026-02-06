import { prisma } from "../../../lib/prisma";
import { invoiceTemplateService } from "../../../lib/services/invoice-templates";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { invoiceTemplateCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

export async function GET() {
  try {
    const { user } = await requireFeature("INVOICES_ENHANCED");
    const service = invoiceTemplateService(user.tenantId, prisma);
    const templates = await service.list();
    return jsonOk({ data: templates });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("INVOICES_ENHANCED");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = invoiceTemplateCreateSchema.parse(body);
    const service = invoiceTemplateService(user.tenantId, prisma);
    const template = await service.create(payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "InvoiceTemplate",
      entityId: template.id,
      operation: "CREATE"
    });

    return jsonOk({ data: template }, 201);
  } catch (error) {
    return handleError(error);
  }
}
