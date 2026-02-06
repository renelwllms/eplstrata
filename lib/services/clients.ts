import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient } from "@prisma/client";

export function clientService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list() {
      return prisma.client.findMany({ orderBy: { createdAt: "desc" } });
    },
    get(id: string) {
      return prisma.client.findUnique({ where: { id } });
    },
    create(data: {
      name: string;
      status?: "ACTIVE" | "ARCHIVED";
      billingEmail?: string;
      phone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country?: string;
      notes?: string;
    }) {
      return prisma.client.create({ data: { ...data, tenantId } });
    },
    update(id: string, data: Record<string, unknown>) {
      return prisma.client.update({ where: { id }, data });
    },
    remove(id: string) {
      return prisma.client.delete({ where: { id } });
    }
  };
}
