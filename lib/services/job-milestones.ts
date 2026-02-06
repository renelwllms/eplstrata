import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient } from "@prisma/client";

export function jobMilestoneService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list(jobId: string) {
      return prisma.jobMilestone.findMany({
        where: { jobId },
        orderBy: { dueDate: "asc" }
      });
    },
    create(jobId: string, data: { name: string; dueDate?: string; isComplete?: boolean }) {
      return prisma.jobMilestone.create({
        data: {
          tenantId,
          jobId,
          name: data.name,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          isComplete: data.isComplete ?? false
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      const patch = { ...data };
      if (typeof patch.dueDate === "string") {
        patch.dueDate = new Date(patch.dueDate);
      }
      return prisma.jobMilestone.update({ where: { id }, data: patch });
    },
    remove(id: string) {
      return prisma.jobMilestone.delete({ where: { id } });
    }
  };
}
