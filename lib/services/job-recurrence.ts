import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient, RecurrenceFrequency } from "@prisma/client";

export function jobRecurrenceService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list() {
      return prisma.jobRecurrenceRule.findMany({ orderBy: { createdAt: "desc" } });
    },
    get(id: string) {
      return prisma.jobRecurrenceRule.findUnique({ where: { id } });
    },
    create(data: {
      frequency: RecurrenceFrequency;
      interval?: number;
      startDate: string;
      endDate?: string;
    }) {
      return prisma.jobRecurrenceRule.create({
        data: {
          tenantId,
          frequency: data.frequency,
          interval: data.interval ?? 1,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : undefined
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      const patch = { ...data };
      if (typeof patch.startDate === "string") {
        patch.startDate = new Date(patch.startDate);
      }
      if (typeof patch.endDate === "string") {
        patch.endDate = new Date(patch.endDate);
      }
      return prisma.jobRecurrenceRule.update({ where: { id }, data: patch });
    },
    remove(id: string) {
      return prisma.jobRecurrenceRule.delete({ where: { id } });
    }
  };
}
