import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient, NotificationType } from "@prisma/client";

export function notificationService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list(userId: string) {
      return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50
      });
    },
    create(params: {
      userId: string;
      type?: NotificationType;
      title: string;
      body?: string;
      entityType?: string;
      entityId?: string;
    }) {
      return prisma.notification.create({
        data: {
          tenantId,
          userId: params.userId,
          type: params.type ?? "SYSTEM",
          title: params.title,
          body: params.body,
          entityType: params.entityType,
          entityId: params.entityId
        }
      });
    },
    markRead(id: string) {
      return prisma.notification.update({
        where: { id },
        data: { readAt: new Date() }
      });
    }
  };
}
