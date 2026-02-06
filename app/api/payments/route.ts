import { prisma } from "../../../lib/prisma";
import { paymentService } from "../../../lib/services/payments";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { paymentCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";

export async function GET() {
  try {
    const { user } = await requireFeature("PAYMENTS");
    const service = paymentService(user.tenantId, prisma);
    const payments = await service.list(user.id, user.role);
    return jsonOk({ data: payments });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("PAYMENTS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = paymentCreateSchema.parse(body);

    const service = paymentService(user.tenantId, prisma);
    const payment = await service.create(payload);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Payment",
      entityId: payment.id,
      operation: "CREATE"
    });

    return jsonOk({ data: payment }, 201);
  } catch (error) {
    return handleError(error);
  }
}
