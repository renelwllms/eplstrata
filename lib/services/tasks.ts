import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient } from "@prisma/client";

export function taskService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list() {
      return prisma.taskCatalog.findMany({ orderBy: { createdAt: "desc" } });
    },
    get(id: string) {
      return prisma.taskCatalog.findUnique({ where: { id } });
    },
    create(data: {
      name: string;
      defaultBillableRate?: number;
      isActive?: boolean;
    }) {
      return prisma.taskCatalog.create({
        data: {
          tenantId,
          name: data.name,
          defaultBillableRate: data.defaultBillableRate,
          isActive: data.isActive
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      return prisma.taskCatalog.update({ where: { id }, data });
    },
    remove(id: string) {
      return prisma.taskCatalog.delete({ where: { id } });
    }
  };
}
