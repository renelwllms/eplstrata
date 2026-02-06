import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient } from "@prisma/client";

export function jobStageService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list() {
      return prisma.jobStage.findMany({ orderBy: { sortOrder: "asc" } });
    },
    get(id: string) {
      return prisma.jobStage.findUnique({ where: { id } });
    },
    create(data: { name: string; color?: string; sortOrder?: number; isClosed?: boolean }) {
      return prisma.jobStage.create({
        data: {
          tenantId,
          name: data.name,
          color: data.color,
          sortOrder: data.sortOrder ?? 0,
          isClosed: data.isClosed ?? false
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      return prisma.jobStage.update({ where: { id }, data });
    },
    remove(id: string) {
      return prisma.jobStage.delete({ where: { id } });
    }
  };
}
