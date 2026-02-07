import { prisma } from "../../../../lib/prisma";
import { paymentService } from "../../../../lib/services/payments";
import { requireFeature, requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { paymentUpdateSchema } from "../../../../lib/validators";
import { auditCrudStub } from "../../../../lib/audit";
import { assertJobAccess } from "../../../../lib/job-access";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireFeature("PAYMENTS");
    const service = paymentService(user.tenantId, prisma);
    const payment = await service.get(id);

    if (payment && user.role === "STAFF") {
      const invoice = await prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
        select: { jobId: true }
      });

      if (invoice?.jobId) {
        await assertJobAccess({
          tenantId: user.tenantId,
          userId: user.id,
          role: user.role,
          jobId: invoice.jobId
        });
      }
    }

    return jsonOk({ data: payment });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("PAYMENTS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = paymentUpdateSchema.parse(body);

    const service = paymentService(user.tenantId, prisma);
    const payment = await service.update(id, payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Payment",
      entityId: payment.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: payment });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("PAYMENTS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const service = paymentService(user.tenantId, prisma);
    const payment = await service.remove(id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Payment",
      entityId: payment.id,
      operation: "DELETE"
    });

    return jsonOk({ data: payment });
  } catch (error) {
    return handleError(error);
  }
}
