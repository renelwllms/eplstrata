import {
  DashboardSummary,
  PipelineSnapshot,
  ApprovalsPayload,
  UtilizationPayload,
  RevenuePayload,
  AttentionItem
} from "../types/dashboard";

export type DashboardFilters = {
  range?: "7d" | "30d" | "month" | "custom";
  team?: "all" | "my";
  owner?: "me" | "all";
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getFilterFactor = (filters?: DashboardFilters) => {
  const rangeFactor =
    filters?.range === "30d" ? 1.15 : filters?.range === "month" ? 1.1 : filters?.range === "custom" ? 0.95 : 1;
  const teamFactor = filters?.team === "my" ? 0.7 : 1;
  const ownerFactor = filters?.owner === "me" ? 0.85 : 1;
  return rangeFactor * teamFactor * ownerFactor;
};

 const spark = (base: number, variance: number) =>
   Array.from({ length: 7 }, (_, i) => {
     const wave = Math.sin(i / 1.6) * variance;
     return Math.max(0, Math.round(base + wave + i * 0.4));
   });

export const getSummary = (filters?: DashboardFilters): DashboardSummary => {
  const factor = getFilterFactor(filters);
  const overdue = Math.max(0, Math.round(18 * factor));
  const revenue = Math.max(0, Math.round(38450 * factor));
  const utilization = clamp(Math.round(74 * (filters?.team === "my" ? 1.05 : factor)), 40, 98);
  return {
    overdueTasks: {
      label: "Overdue tasks",
      value: overdue,
      formattedValue: overdue.toLocaleString(),
      delta: -6,
      deltaDirection: "down",
      sparkline: spark(Math.round(22 * factor), 4)
    },
    revenueMonth: {
      label: "Revenue this month",
      value: revenue,
      formattedValue: `NZ$ ${revenue.toLocaleString()}`,
      delta: 12,
      deltaDirection: "up",
      sparkline: spark(Math.round(28 * factor), 6)
    },
    utilization: {
      label: "Utilization",
      value: utilization,
      formattedValue: `${utilization}%`,
      delta: 3,
      deltaDirection: "up",
      sparkline: spark(Math.round(68 * (filters?.team === "my" ? 1.02 : factor)), 5).map((value) =>
        clamp(value, 40, 98)
      )
    }
  };
};

export const getPipeline = (filters?: DashboardFilters): PipelineSnapshot => {
  const factor = getFilterFactor(filters);
  const stage = (base: number) => Math.max(0, Math.round(base * factor));
  const winRate = clamp(Math.round(38 * (filters?.team === "my" ? 1.08 : factor)), 12, 90);
  const avgDaysToWin = Math.max(2, Math.round(19 * (filters?.owner === "me" ? 0.85 : factor)));
  const avgDaysInStage = Math.max(1, Math.round(6 * (filters?.owner === "me" ? 0.85 : factor)));
  return {
    stages: [
      { stage: "New", count: stage(24), conversionRate: 84 },
      { stage: "Qualified", count: stage(18), conversionRate: 68 },
      { stage: "Proposal", count: stage(12), conversionRate: 52 },
      { stage: "Won", count: stage(9), conversionRate: 38 },
      { stage: "Lost", count: stage(5), conversionRate: 22 },
      { stage: "Unassigned", count: stage(4), conversionRate: 16 }
    ],
    winRate,
    avgDaysToWin,
    avgDaysInStage
  };
};

export const getApprovals = (filters?: DashboardFilters): ApprovalsPayload => {
  const factor = getFilterFactor(filters);
  const adjustHours = (value: number) => Math.max(1, Math.round(value * factor));
  const adjustCount = (value: number) => Math.max(0, Math.round(value * factor));
  return {
    pending: [
      {
        id: "ts-1",
        person: "Renee Matthews",
        period: "Jan 22 - Jan 28",
        hours: adjustHours(38),
        submittedAt: "2h ago"
      },
      {
        id: "ts-2",
        person: "Kai Chen",
        period: "Jan 22 - Jan 28",
        hours: adjustHours(41),
        submittedAt: "1d ago"
      }
    ],
    aging: [
      { bucket: "0-1d", count: adjustCount(3) },
      { bucket: "2-3d", count: adjustCount(2) },
      { bucket: "4-7d", count: adjustCount(1) },
      { bucket: "8d+", count: adjustCount(0) }
    ]
  };
};

export const getUtilization = (filters?: DashboardFilters): UtilizationPayload => {
  const factor = getFilterFactor(filters);
  const adjust = (value: number) => clamp(Math.round(value * (filters?.team === "my" ? 1.05 : factor)), 30, 98);
  return {
    utilizationPercent: adjust(74),
    billablePercent: adjust(62),
    nonBillablePercent: clamp(Math.round(12 * factor), 2, 40),
    weeklyTrend: [
      { day: "Mon", value: adjust(68) },
      { day: "Tue", value: adjust(72) },
      { day: "Wed", value: adjust(70) },
      { day: "Thu", value: adjust(78) },
      { day: "Fri", value: adjust(76) },
      { day: "Sat", value: adjust(52) },
      { day: "Sun", value: adjust(44) }
    ],
    topStaff: [
      { name: "Renee Matthews", percent: adjust(86), billable: adjust(72) },
      { name: "Kai Chen", percent: adjust(82), billable: adjust(68) },
      { name: "Zara Patel", percent: adjust(78), billable: adjust(64) },
      { name: "Mateo Silva", percent: adjust(74), billable: adjust(60) },
      { name: "Ariana Brooks", percent: adjust(71), billable: adjust(58) }
    ]
  };
};

 export const getRevenue = (range: "7d" | "30d"): RevenuePayload => ({
   trend:
     range === "7d"
       ? [
           { date: "Mon", oneOff: 4200, recurring: 1200 },
           { date: "Tue", oneOff: 3800, recurring: 1300 },
           { date: "Wed", oneOff: 5100, recurring: 1600 },
           { date: "Thu", oneOff: 4700, recurring: 1500 },
           { date: "Fri", oneOff: 5600, recurring: 1800 },
           { date: "Sat", oneOff: 2400, recurring: 900 },
           { date: "Sun", oneOff: 1900, recurring: 700 }
         ]
       : Array.from({ length: 30 }, (_, i) => ({
           date: `Day ${i + 1}`,
           oneOff: 2500 + (i % 6) * 400,
           recurring: 900 + (i % 5) * 120
         })),
   categories: ["Service", "Client", "Job type"]
 });

export const getAttentionItems = (filters?: DashboardFilters): AttentionItem[] => {
  const factor = getFilterFactor(filters);
  const adjust = (value: number) => Math.max(0, Math.round(value * factor));
  return [
    { label: "Jobs stuck > 10 days", count: adjust(6), href: "/app/jobs?filter=stuck" },
    { label: "Unbilled completed jobs", count: adjust(4), href: "/app/jobs?filter=unbilled" },
    { label: "Over-budget jobs", count: adjust(3), href: "/app/jobs?filter=over-budget" },
    { label: "Unassigned leads > 48h", count: adjust(5), href: "/app/leads?filter=unassigned" },
    { label: "Overdue tasks", count: adjust(18), href: "/app/tasks?filter=overdue" }
  ];
};
