import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient, Role } from "@prisma/client";

export function costService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    async list(userId: string, role: Role) {
      if (role === "STAFF") {
        return prisma.costEntry.findMany({
          where: {
            job: {
              assignments: {
                some: { userId }
              }
            }
          },
          orderBy: { createdAt: "desc" }
        });
      }

      return prisma.costEntry.findMany({ orderBy: { createdAt: "desc" } });
    },
    get(id: string) {
      return prisma.costEntry.findUnique({ where: { id } });
    },
    create(data: {
      jobId: string;
      description: string;
      qty: number;
      unitCost: number;
      markupPercent: number;
      billable?: boolean;
    }) {
      return prisma.costEntry.create({
        data: {
          tenantId,
          jobId: data.jobId,
          description: data.description,
          qty: data.qty,
          unitCost: data.unitCost,
          markupPercent: data.markupPercent,
          billable: data.billable ?? true
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      return prisma.costEntry.update({ where: { id }, data });
    },
    remove(id: string) {
      return prisma.costEntry.delete({ where: { id } });
    }
  };
}
