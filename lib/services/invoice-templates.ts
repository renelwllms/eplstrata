import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient } from "@prisma/client";

export function invoiceTemplateService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list() {
      return prisma.invoiceTemplate.findMany({ orderBy: { createdAt: "desc" } });
    },
    get(id: string) {
      return prisma.invoiceTemplate.findUnique({ where: { id } });
    },
    create(data: { name: string; layout?: string; defaults?: Record<string, unknown> }) {
      return prisma.invoiceTemplate.create({
        data: {
          tenantId,
          name: data.name,
          layout: data.layout ?? "STANDARD",
          defaults: data.defaults ?? undefined
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      return prisma.invoiceTemplate.update({ where: { id }, data });
    },
    remove(id: string) {
      return prisma.invoiceTemplate.delete({ where: { id } });
    }
  };
}
