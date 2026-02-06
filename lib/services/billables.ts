import type { PrismaClient } from "@prisma/client";
import { tenantScopedPrisma } from "../tenant";
import { round2 } from "../billing";

export async function getBillableSummary(params: {
  tenantId: string;
  jobId: string;
  client: PrismaClient;
  timeEntryIds?: string[];
  costEntryIds?: string[];
}) {
  const prisma = tenantScopedPrisma(params.tenantId, params.client);

  const timeWhere: Record<string, unknown> = {
    jobId: params.jobId,
    billable: true,
    invoiceId: null
  };

  if (params.timeEntryIds?.length) {
    timeWhere.id = { in: params.timeEntryIds };
  }

  const costWhere: Record<string, unknown> = {
    jobId: params.jobId,
    billable: true,
    invoiceId: null
  };

  if (params.costEntryIds?.length) {
    costWhere.id = { in: params.costEntryIds };
  }

  const timeEntries = await prisma.timeEntry.findMany({
    where: timeWhere,
    include: { task: true }
  });

  const costEntries = await prisma.costEntry.findMany({
    where: costWhere
  });

  const timeItems = timeEntries.map((entry) => {
    const rate = Number(entry.task.defaultBillableRate ?? 0);
    const hours = entry.durationMinutes / 60;
    const amount = round2(hours * rate);
    return {
      id: entry.id,
      date: entry.date,
      durationMinutes: entry.durationMinutes,
      rate,
      amount,
      description: entry.notes ?? "Time entry"
    };
  });

  const costItems = costEntries.map((entry) => {
    const base = Number(entry.qty) * Number(entry.unitCost);
    const amount = round2(base * (1 + Number(entry.markupPercent) / 100));
    return {
      id: entry.id,
      description: entry.description,
      qty: Number(entry.qty),
      unitCost: Number(entry.unitCost),
      markupPercent: Number(entry.markupPercent),
      amount
    };
  });

  const totals = {
    timeTotal: round2(timeItems.reduce((sum, item) => sum + item.amount, 0)),
    costTotal: round2(costItems.reduce((sum, item) => sum + item.amount, 0))
  };

  return {
    timeItems,
    costItems,
    totals: {
      ...totals,
      billableTotal: round2(totals.timeTotal + totals.costTotal)
    }
  };
}
