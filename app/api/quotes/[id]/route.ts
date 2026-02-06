import { prisma } from "../../../../lib/prisma";
import { quoteService } from "../../../../lib/services/quotes";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { quoteUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";
import { assertJobAccess } from "../../../../lib/job-access";
import { sendEmail } from "../../../../lib/mailer";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireFeature("QUOTES");
    const service = quoteService(user.tenantId, prisma);
    const quote = await service.get(params.id);

    if (quote?.jobId && user.role === "STAFF") {
      await assertJobAccess({
        tenantId: user.tenantId,
        userId: user.id,
        role: user.role,
        jobId: quote.jobId
      });
    }

    return jsonOk({ data: quote });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("QUOTES");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = quoteUpdateSchema.parse(body);

    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: user.tenantId }
    });

    if (!settings) {
      throw new Error("Tenant settings missing");
    }

    const existing = await prisma.quote.findUnique({
      where: { id: params.id },
      include: { client: true }
    });

    if (!existing || existing.tenantId !== user.tenantId) {
      return jsonOk({ data: null }, 404);
    }

    const service = quoteService(user.tenantId, prisma);
    const quote = await service.update(params.id, {
      status: payload.status,
      approvalStatus: payload.approvalStatus,
      isMaster: payload.isMaster,
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

    if (!quote) {
      return jsonOk({ data: null }, 404);
    }

    const approvalChanged =
      payload.approvalStatus &&
      payload.approvalStatus !== existing.approvalStatus;

    if (approvalChanged && existing.client?.billingEmail) {
      const appUrl =
        process.env.APP_BASE_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        "https://app.strata.edgepoint.co.nz";

      await sendEmail({
        to: existing.client.billingEmail,
        subject: `Quote ${quote.number} ${payload.approvalStatus?.toLowerCase()}`,
        text: [
          `Quote ${quote.number} has been ${payload.approvalStatus?.toLowerCase()}.`,
          `Client: ${existing.client?.name ?? "Unknown"}`,
          `Total: ${Number(quote.total).toFixed(2)} ${quote.currency}`,
          `View quote: ${appUrl}/app/quotes/${quote.id}/print`
        ].join("\n")
      });
    }

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Quote",
      entityId: quote.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: quote });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireWriteAccess("QUOTES");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = quoteService(user.tenantId, prisma);
    const quote = await service.remove(params.id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Quote",
      entityId: quote.id,
      operation: "DELETE"
    });

    return jsonOk({ data: quote });
  } catch (error) {
    return handleError(error);
  }
}
