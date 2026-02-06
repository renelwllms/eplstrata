import { prisma } from "../../../../lib/prisma";
import { invoiceService } from "../../../../lib/services/invoices";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { invoiceUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";
import { assertJobAccess } from "../../../../lib/job-access";
import { sendEmail } from "../../../../lib/mailer";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("INVOICES");
    const service = invoiceService(user.tenantId, prisma);
    const invoice = await service.get(params.id);

    if (invoice?.jobId && user.role === "STAFF") {
      await assertJobAccess({
        tenantId: user.tenantId,
        userId: user.id,
        role: user.role,
        jobId: invoice.jobId
      });
    }

    return jsonOk({ data: invoice });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("INVOICES");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = invoiceUpdateSchema.parse(body);

    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: user.tenantId }
    });

    if (!settings) {
      throw new Error("Tenant settings missing");
    }

    const existing = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { client: true }
    });

    if (!existing || existing.tenantId !== user.tenantId) {
      return jsonOk({ data: null }, 404);
    }

    const service = invoiceService(user.tenantId, prisma);
    const invoice = await service.update(params.id, {
      status: payload.status,
      billingMode: payload.billingMode,
      progressPercent: payload.progressPercent,
      lineItems: payload.lineItems,
      fields: {
        clientId: payload.clientId,
        jobId: payload.jobId,
        templateId: payload.templateId
      },
      settings: payload.lineItems
        ? {
            gstRate: Number(settings.gstRate),
            taxMode: settings.taxMode,
            taxDiscountMode: settings.taxDiscountMode,
            currency: settings.currency
          }
        : undefined
    });

    if (!invoice) {
      return jsonOk({ data: null }, 404);
    }

    const transitionedToSent =
      payload.status === "SENT" && existing.status !== "SENT";

    if (transitionedToSent) {
      const recipient =
        existing.client?.billingEmail ??
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
            `Client: ${existing.client?.name ?? "Unknown"}`,
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
      operation: "UPDATE"
    });

    return jsonOk({ data: invoice });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("INVOICES");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = invoiceService(user.tenantId, prisma);
    const invoice = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Invoice",
      entityId: invoice.id,
      operation: "DELETE"
    });

    return jsonOk({ data: invoice });
  } catch (error) {
    return handleError(error);
  }
}
