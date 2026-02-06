import { prisma } from "./prisma";
import {
  getSummary as getMockSummary,
  getPipeline as getMockPipeline,
  getApprovals as getMockApprovals,
  getUtilization as getMockUtilization,
  getRevenue as getMockRevenue,
  getAttentionItems as getMockAttentionItems
} from "./dashboard-mock";
import type {
  DashboardSummary,
  PipelineSnapshot,
  ApprovalsPayload,
  UtilizationPayload,
  RevenuePayload,
  AttentionItem
} from "../types/dashboard";
import type { DashboardFilters } from "./dashboard-mock";

const DEMO_LEAD_TOKEN = "demo-lead-capture";
const DEMO_TENANT_NAMES = ["acme services ltd", "demo"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency }).format(value);
}

async function getTenantSettings(tenantId: string) {
  return prisma.tenantSettings.findUnique({ where: { tenantId } });
}

async function getTenantName(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
  return tenant?.name ?? null;
}

export async function isDemoTenant(tenantId: string) {
  const settings = await getTenantSettings(tenantId);
  if (settings?.leadCaptureToken === DEMO_LEAD_TOKEN) return true;
  const name = (await getTenantName(tenantId))?.toLowerCase() ?? "";
  return DEMO_TENANT_NAMES.some((demo) => name.includes(demo));
}

export async function getDashboardSummary(tenantId: string): Promise<DashboardSummary> {
  const now = new Date();
  const today = startOfDay(now);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const settings = await getTenantSettings(tenantId);
  const currency = settings?.currency ?? "NZD";

  const overdueJobs = await prisma.job.count({
    where: {
      tenantId,
      dueDate: { lt: today },
      status: { in: ["QUOTE", "ACTIVE", "ON_HOLD"] }
    }
  });

  const revenueAgg = await prisma.invoice.aggregate({
    where: {
      tenantId,
      status: "PAID",
      createdAt: { gte: startMonth, lt: nextMonth }
    },
    _sum: { total: true }
  });

  const revenueTotal = Number(revenueAgg._sum.total ?? 0);

  const utilization = await getUtilizationPayload(tenantId);
  const utilizationPercent = utilization.utilizationPercent;

  const flatSpark = (value: number) => Array.from({ length: 7 }, () => value);

  return {
    overdueTasks: {
      label: "Overdue tasks",
      value: overdueJobs,
      formattedValue: overdueJobs.toLocaleString(),
      delta: 0,
      deltaDirection: "flat",
      sparkline: flatSpark(overdueJobs)
    },
    revenueMonth: {
      label: "Revenue this month",
      value: revenueTotal,
      formattedValue: formatCurrency(revenueTotal, currency),
      delta: 0,
      deltaDirection: "flat",
      sparkline: flatSpark(Math.round(revenueTotal / 1000))
    },
    utilization: {
      label: "Utilization",
      value: utilizationPercent,
      formattedValue: `${utilizationPercent}%`,
      delta: 0,
      deltaDirection: "flat",
      sparkline: utilization.weeklyTrend.map((point) => point.value)
    }
  };
}

export async function getPipelineSnapshot(tenantId: string): Promise<PipelineSnapshot> {
  const stages = await prisma.leadStage.findMany({
    where: { tenantId },
    orderBy: { sortOrder: "asc" }
  });
  const totalLeads = await prisma.lead.count({ where: { tenantId } });

  const stageCounts = await prisma.lead.groupBy({
    by: ["stageId"],
    where: { tenantId },
    _count: { stageId: true }
  });

  const stageCountMap = new Map(stageCounts.map((entry) => [entry.stageId, entry._count.stageId]));

  const wonStageIds = stages.filter((stage) => stage.isWon).map((stage) => stage.id);
  const closedStageIds = stages.filter((stage) => stage.isClosed).map((stage) => stage.id);
  const wonCount = wonStageIds.length
    ? await prisma.lead.count({ where: { tenantId, stageId: { in: wonStageIds } } })
    : 0;
  const closedCount = closedStageIds.length
    ? await prisma.lead.count({ where: { tenantId, stageId: { in: closedStageIds } } })
    : 0;

  const pipelineStages = stages.map((stage) => {
    const count = stageCountMap.get(stage.id) ?? 0;
    const conversionRate = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
    return { stage: stage.name, count, conversionRate };
  });

  return {
    stages: pipelineStages,
    winRate: closedCount ? Math.round((wonCount / closedCount) * 100) : 0,
    avgDaysToWin: 0,
    avgDaysInStage: 0
  };
}

export async function getApprovalsPayload(): Promise<ApprovalsPayload> {
  return { pending: [], aging: [] };
}

export async function getUtilizationPayload(tenantId: string): Promise<UtilizationPayload> {
  const now = new Date();
  const start = startOfDay(addDays(now, -6));
  const end = addDays(startOfDay(now), 1);

  const entries = await prisma.timeEntry.findMany({
    where: { tenantId, date: { gte: start, lt: end } },
    select: { date: true, durationMinutes: true, billable: true, userId: true }
  });

  const totalsByDay = new Map<string, { total: number; billable: number }>();
  const totalsByUser = new Map<string, { total: number; billable: number }>();

  for (const entry of entries) {
    const dayKey = startOfDay(entry.date).toISOString().slice(0, 10);
    const dayTotals = totalsByDay.get(dayKey) ?? { total: 0, billable: 0 };
    dayTotals.total += entry.durationMinutes;
    if (entry.billable) dayTotals.billable += entry.durationMinutes;
    totalsByDay.set(dayKey, dayTotals);

    const userTotals = totalsByUser.get(entry.userId) ?? { total: 0, billable: 0 };
    userTotals.total += entry.durationMinutes;
    if (entry.billable) userTotals.billable += entry.durationMinutes;
    totalsByUser.set(entry.userId, userTotals);
  }

  const totalMinutes = Array.from(totalsByDay.values()).reduce((sum, item) => sum + item.total, 0);
  const billableMinutes = Array.from(totalsByDay.values()).reduce((sum, item) => sum + item.billable, 0);
  const billablePercent = totalMinutes ? Math.round((billableMinutes / totalMinutes) * 100) : 0;
  const nonBillablePercent = totalMinutes ? Math.max(0, 100 - billablePercent) : 0;

  const weeklyTrend = Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(start, offset);
    const dayKey = date.toISOString().slice(0, 10);
    const totals = totalsByDay.get(dayKey) ?? { total: 0, billable: 0 };
    const value = totals.total ? Math.round((totals.billable / totals.total) * 100) : 0;
    const label = date.toLocaleDateString("en-NZ", { weekday: "short" });
    return { day: label, value };
  });

  const topUsers = Array.from(totalsByUser.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const userIds = topUsers.map(([userId]) => userId);
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
    : [];
  const userMap = new Map(users.map((user) => [user.id, user]));

  const topStaff = topUsers.map(([userId, totals]) => {
    const user = userMap.get(userId);
    const percent = totalMinutes ? Math.round((totals.total / totalMinutes) * 100) : 0;
    const billable = totals.total ? Math.round((totals.billable / totals.total) * 100) : 0;
    return { name: user?.name ?? user?.email ?? "Unknown", percent, billable };
  });

  return {
    utilizationPercent: billablePercent,
    billablePercent,
    nonBillablePercent,
    weeklyTrend,
    topStaff
  };
}

export async function getRevenuePayload(
  tenantId: string,
  range: "7d" | "30d"
): Promise<RevenuePayload> {
  const now = new Date();
  const days = range === "30d" ? 30 : 7;
  const start = startOfDay(addDays(now, -(days - 1)));
  const end = addDays(startOfDay(now), 1);

  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      status: "PAID",
      createdAt: { gte: start, lt: end }
    },
    select: { createdAt: true, total: true }
  });

  const totalsByDay = new Map<string, number>();
  for (const invoice of invoices) {
    const dayKey = startOfDay(invoice.createdAt).toISOString().slice(0, 10);
    totalsByDay.set(dayKey, (totalsByDay.get(dayKey) ?? 0) + Number(invoice.total));
  }

  const trend = Array.from({ length: days }, (_, offset) => {
    const date = addDays(start, offset);
    const dayKey = date.toISOString().slice(0, 10);
    const label =
      range === "7d"
        ? date.toLocaleDateString("en-NZ", { weekday: "short" })
        : date.toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
    const value = totalsByDay.get(dayKey) ?? 0;
    return { date: label, oneOff: Math.round(value), recurring: 0 };
  });

  return { trend, categories: ["Service", "Client", "Job type"] };
}

export async function getAttentionItemsPayload(tenantId: string): Promise<AttentionItem[]> {
  const now = new Date();
  const overdueCutoff = startOfDay(now);
  const staleCutoff = addDays(now, -10);
  const unassignedCutoff = addDays(now, -2);

  const [stuckJobs, overdueJobs, unassignedLeads] = await Promise.all([
    prisma.job.count({
      where: {
        tenantId,
        status: "ACTIVE",
        createdAt: { lt: staleCutoff }
      }
    }),
    prisma.job.count({
      where: {
        tenantId,
        dueDate: { lt: overdueCutoff },
        status: { in: ["QUOTE", "ACTIVE", "ON_HOLD"] }
      }
    }),
    prisma.lead.count({
      where: {
        tenantId,
        ownerUserId: null,
        createdAt: { lt: unassignedCutoff }
      }
    })
  ]);

  return [
    { label: "Jobs stuck > 10 days", count: stuckJobs, href: "/app/jobs?filter=stuck" },
    { label: "Overdue tasks", count: overdueJobs, href: "/app/jobs?filter=overdue" },
    { label: "Unassigned leads > 48h", count: unassignedLeads, href: "/app/leads?filter=unassigned" }
  ];
}

export async function getDashboardSummaryForTenant(
  tenantId: string,
  filters?: DashboardFilters
): Promise<DashboardSummary> {
  if (await isDemoTenant(tenantId)) {
    return getMockSummary(filters);
  }
  return getDashboardSummary(tenantId);
}

export async function getPipelineSnapshotForTenant(
  tenantId: string,
  filters?: DashboardFilters
): Promise<PipelineSnapshot> {
  if (await isDemoTenant(tenantId)) {
    return getMockPipeline(filters);
  }
  return getPipelineSnapshot(tenantId);
}

export async function getApprovalsPayloadForTenant(
  tenantId: string,
  filters?: DashboardFilters
): Promise<ApprovalsPayload> {
  if (await isDemoTenant(tenantId)) {
    return getMockApprovals(filters);
  }
  return getApprovalsPayload();
}

export async function getUtilizationPayloadForTenant(
  tenantId: string,
  filters?: DashboardFilters
): Promise<UtilizationPayload> {
  if (await isDemoTenant(tenantId)) {
    return getMockUtilization(filters);
  }
  return getUtilizationPayload(tenantId);
}

export async function getRevenuePayloadForTenant(
  tenantId: string,
  range: "7d" | "30d"
): Promise<RevenuePayload> {
  if (await isDemoTenant(tenantId)) {
    return getMockRevenue(range);
  }
  return getRevenuePayload(tenantId, range);
}

export async function getAttentionItemsForTenant(
  tenantId: string,
  filters?: DashboardFilters
): Promise<AttentionItem[]> {
  if (await isDemoTenant(tenantId)) {
    return getMockAttentionItems(filters);
  }
  return getAttentionItemsPayload(tenantId);
}
