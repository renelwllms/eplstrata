import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient } from "@prisma/client";

export function quoteTemplateService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list() {
      return prisma.quoteTemplate.findMany({ orderBy: { createdAt: "desc" } });
    },
    get(id: string) {
      return prisma.quoteTemplate.findUnique({ where: { id } });
    },
    create(data: { name: string; layout?: string; defaults?: Record<string, unknown> }) {
      return prisma.quoteTemplate.create({
        data: {
          tenantId,
          name: data.name,
          layout: data.layout ?? "STANDARD",
          defaults: data.defaults ?? undefined
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      return prisma.quoteTemplate.update({ where: { id }, data });
    },
    remove(id: string) {
      return prisma.quoteTemplate.delete({ where: { id } });
    }
  };
}
