import type { PrismaClient, NumberEntityType } from "@prisma/client";

const DEFAULTS: Record<NumberEntityType, { prefix: string; nextNumber: number }> = {
  JOB: { prefix: "J-", nextNumber: 1000 },
  QUOTE: { prefix: "Q-", nextNumber: 2000 },
  INVOICE: { prefix: "INV-", nextNumber: 3000 },
  PO: { prefix: "PO-", nextNumber: 4000 }
};

export async function consumeNextNumber(
  prisma: PrismaClient,
  tenantId: string,
  entityType: NumberEntityType
) {
  const fallback = DEFAULTS[entityType];
  return prisma.$transaction(async (tx) => {
    const existing = await tx.numberSequence.findUnique({
      where: { tenantId_entityType: { tenantId, entityType } }
    });

    if (existing) {
      const updated = await tx.numberSequence.update({
        where: { tenantId_entityType: { tenantId, entityType } },
        data: { nextNumber: { increment: 1 } }
      });
      const usedNumber = updated.nextNumber - 1;
      return `${updated.prefix}${usedNumber}`;
    }

    const start = fallback?.nextNumber ?? 1;
    const prefix = fallback?.prefix ?? "";
    await tx.numberSequence.create({
      data: {
        tenantId,
        entityType,
        prefix,
        nextNumber: start + 1
      }
    });
    return `${prefix}${start}`;
  });
}
