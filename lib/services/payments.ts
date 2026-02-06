import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient, Role } from "@prisma/client";

export function paymentService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    async list(userId: string, role: Role) {
      if (role === "STAFF") {
        return prisma.payment.findMany({
          where: {
            invoice: {
              job: {
                assignments: { some: { userId } }
              }
            }
          },
          orderBy: { createdAt: "desc" }
        });
      }

      return prisma.payment.findMany({ orderBy: { createdAt: "desc" } });
    },
    get(id: string) {
      return prisma.payment.findUnique({ where: { id } });
    },
    create(data: {
      invoiceId: string;
      amount: number;
      paymentDate: string;
      reference?: string;
    }) {
      return prisma.payment.create({
        data: {
          tenantId,
          invoiceId: data.invoiceId,
          amount: data.amount,
          paymentDate: new Date(data.paymentDate),
          reference: data.reference
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      const patch = { ...data };
      if (typeof patch.paymentDate === "string") {
        patch.paymentDate = new Date(patch.paymentDate);
      }
      return prisma.payment.update({ where: { id }, data: patch });
    },
    remove(id: string) {
      return prisma.payment.delete({ where: { id } });
    }
  };
}
