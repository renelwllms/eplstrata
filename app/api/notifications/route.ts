import { prisma } from "../../../lib/prisma";
import { notificationService } from "../../../lib/services/notifications";
import { requireFeature, requireWriteAccess } from "../../../lib/guards";
import { jsonOk, handleError } from "../../../lib/api";
import { notificationCreateSchema } from "../../../lib/validators";
import { auditCrudStub } from "../../../lib/audit";
import { sendEmail } from "../../../lib/mailer";

export async function GET() {
  try {
    const { user } = await requireFeature("NOTIFICATIONS");
    const service = notificationService(user.tenantId, prisma);
    const notifications = await service.list(user.id);
    return jsonOk({ data: notifications });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireWriteAccess("NOTIFICATIONS");
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      throw new Error("Insufficient role");
    }
    const body = await request.json();
    const payload = notificationCreateSchema.parse(body);
    const service = notificationService(user.tenantId, prisma);
    const created = await service.create(payload);

    const recipient = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, name: true }
    });

    if (recipient?.email) {
      await sendEmail({
        to: recipient.email,
        subject: payload.title,
        text: payload.body ?? "You have a new notification in Strata."
      });
    }

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Notification",
      entityId: created.id,
      operation: "CREATE"
    });

    return jsonOk({ data: created }, 201);
  } catch (error) {
    return handleError(error);
  }
}
