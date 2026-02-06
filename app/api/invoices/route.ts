import { prisma } from "../../../lib/prisma";
import { invoiceService } from "../../../lib/services/invoices";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { invoiceCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";
import { consumeNextNumber } from "../../../lib/numbering";
import { sendEmail } from "../../../lib/mailer";

export async function GET() {
  try {
    const { user } = await requireFeature("INVOICES");
    const service = invoiceService(user.tenantId, prisma);
    const invoices = await service.list(user.id, user.role);
    return jsonOk({ data: invoices });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("INVOICES");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = invoiceCreateSchema.parse(body);

    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: user.tenantId }
    });

    if (!settings) {
      throw new Error("Tenant settings missing");
    }

    const service = invoiceService(user.tenantId, prisma);
    const number = payload.number ?? (await consumeNextNumber(prisma, user.tenantId, "INVOICE"));
    const invoice = await service.create({
      ...payload,
      number,
      settings: {
        gstRate: Number(settings.gstRate),
        taxMode: settings.taxMode,
        taxDiscountMode: settings.taxDiscountMode,
        currency: settings.currency
      }
    });

    if (payload.status === "SENT") {
      const client = await prisma.client.findUnique({
        where: { id: invoice.clientId },
        select: { billingEmail: true, name: true }
      });

      const recipient =
        client?.billingEmail ??
        settings.businessEmail ??
        process.env.MAILGUN_TO ??
        "";

      if (recipient) {
        const appUrl =
          process.env.APP_BASE_URL ??
          process.env.NEXT_PUBLIC_APP_URL ??
          "https://app.strata.edgepoint.co.nz";

        await sendEmail({
          to: recipient,
          subject: `Invoice ${invoice.number} is ready`,
          text: [
            `Invoice ${invoice.number} is ready.`,
            `Client: ${client?.name ?? "Unknown"}`,
            `Total: ${Number(invoice.total).toFixed(2)} ${invoice.currency}`,
            `View invoice: ${appUrl}/app/invoices/${invoice.id}/print`
          ].join("\n")
        });
      }
    }

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Invoice",
      entityId: invoice.id,
      operation: "CREATE"
    });

    return jsonOk({ data: invoice }, 201);
  } catch (error) {
    return handleError(error);
  }
}
