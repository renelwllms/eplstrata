"use server";

import { prisma } from "../../../lib/prisma";
import { requireFeature } from "../../../lib/guards";
import { auditCrudStub } from "../../../lib/audit";

export async function markNotificationRead(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    throw new Error("Notification id required");
  }

  const { user } = await requireFeature("NOTIFICATIONS");

  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { id: true, userId: true }
  });

  if (!notification || notification.userId !== user.id) {
    throw new Error("Notification not found");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() }
  });

  await auditCrudStub({
    tenantId: user.tenantId,
    actorUserId: user.id,
    entityType: "Notification",
    entityId: updated.id,
    operation: "UPDATE"
  });
}
