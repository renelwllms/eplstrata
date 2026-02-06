import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient, Role } from "@prisma/client";

export function jobService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    async list(userId: string, role: Role) {
      if (role === "STAFF") {
        return prisma.job.findMany({
          where: {
            assignments: {
              some: { userId }
            }
          },
          orderBy: { createdAt: "desc" }
        });
      }

      return prisma.job.findMany({ orderBy: { createdAt: "desc" } });
    },
    get(id: string) {
      return prisma.job.findUnique({ where: { id } });
    },
    create(data: {
      clientId: string;
      jobNumber: string;
      name: string;
      status?: "QUOTE" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
      startDate?: string;
      dueDate?: string;
      budgetMinutes?: number;
      recurrenceRuleId?: string;
    }) {
      return prisma.job.create({
        data: {
          tenantId,
          clientId: data.clientId,
          jobNumber: data.jobNumber,
          name: data.name,
          status: data.status,
          recurrenceRuleId: data.recurrenceRuleId,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          budgetMinutes: data.budgetMinutes
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      const startDate = typeof data.startDate === "string" ? new Date(data.startDate) : undefined;
      const dueDate = typeof data.dueDate === "string" ? new Date(data.dueDate) : undefined;
      const patch = { ...data };

      if (startDate) patch.startDate = startDate;
      if (dueDate) patch.dueDate = dueDate;

      return prisma.job.update({ where: { id }, data: patch });
    },
    remove(id: string) {
      return prisma.job.delete({ where: { id } });
    }
  };
}
