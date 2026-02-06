import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient } from "@prisma/client";

export function phaseService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list(jobId: string) {
      return prisma.phase.findMany({ where: { jobId }, orderBy: { createdAt: "asc" } });
    },
    get(id: string) {
      return prisma.phase.findUnique({ where: { id } });
    },
    create(jobId: string, data: { name: string; budgetMinutes?: number; customField?: string }) {
      return prisma.phase.create({
        data: {
          tenantId,
          jobId,
          name: data.name,
          budgetMinutes: data.budgetMinutes,
          customField: data.customField
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      return prisma.phase.update({ where: { id }, data });
    },
    remove(id: string) {
      return prisma.phase.delete({ where: { id } });
    }
  };
}
