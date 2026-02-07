import { prisma } from "../../../../lib/prisma";
import { notificationService } from "../../../../lib/services/notifications";
import { requireWriteAccess } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { auditCrudStub } from "../../../../lib/audit";

export async function PUT(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await requireWriteAccess("NOTIFICATIONS");
    const service = notificationService(user.tenantId, prisma);
    const updated = await service.markRead(id);

    await auditCrudStub({
      tenantId: user.tenantId,
      actorUserId: user.id,
      entityType: "Notification",
      entityId: updated.id,
      operation: "UPDATE"
    });

    return jsonOk({ data: updated });
  } catch (error) {
    return handleError(error);
  }
}
