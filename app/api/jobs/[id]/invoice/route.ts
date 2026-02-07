import { prisma } from "../../../../../lib/prisma";
import { requireWriteAccess } from "../../../../../lib/guards";
import { jsonOk, handleError } from "../../../../../lib/api";
import { billableSummarySchema } from "../../../../../lib/validators";
import { getBillableSummary } from "../../../../../lib/services/billables";
import { invoiceService } from "../../../../../lib/services/invoices";
import { auditCrudStub } from "../../../../../lib/audit";
import { tenantScopedPrisma } from "../../../../../lib/tenant";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("INVOICES");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = billableSummarySchema.parse(body);

    const scoped = tenantScopedPrisma(user.tenantId, prisma);
    const job = await scoped.job.findUnique({ where: { id: id } });

    if (!job) {
      return jsonOk({ data: null }, 404);
    }

    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: user.tenantId }
    });

    if (!settings) {
      throw new Error("Tenant settings missing");
    }

    const summary = await getBillableSummary({
      tenantId: user.tenantId,
      jobId: id,
      client: prisma,
      timeEntryIds: payload.timeEntryIds,
      costEntryIds: payload.costEntryIds
    });

    const lineItems = [
      ...summary.timeItems.map((item) => ({
        description: item.description,
        quantity: item.durationMinutes / 60,
        rate: item.rate,
        discountPercent: 0
      })),
      ...summary.costItems.map((item) => ({
        description: item.description,
        quantity: item.qty,
        rate: item.unitCost * (1 + item.markupPercent / 100),
        discountPercent: 0
      }))
    ];

    if (lineItems.length === 0) {
      return jsonOk({ error: "No billables available" }, 400);
    }

    const service = invoiceService(user.tenantId, prisma);
    const invoice = await service.create({
      clientId: job.clientId,
      jobId: job.id,
      number: `INV-${Date.now()}`,
      status: "DRAFT",
      lineItems,
      settings: {
        gstRate: Number(settings.gstRate),
        taxMode: settings.taxMode,
        taxDiscountMode: settings.taxDiscountMode,
        currency: settings.currency
      }
    });

    await prisma.timeEntry.updateMany({
      where: { id: { in: summary.timeItems.map((item) => item.id) } },
      data: { invoiceId: invoice.id }
    });

    await prisma.costEntry.updateMany({
      where: { id: { in: summary.costItems.map((item) => item.id) } },
      data: { invoiceId: invoice.id }
    });

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Invoice",
      entityId: invoice.id,
      operation: "CREATE_FROM_BILLABLES"
    });

    return jsonOk({ data: invoice }, 201);
  } catch (error) {
    return handleError(error);
  }
}
