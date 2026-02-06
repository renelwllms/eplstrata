import { prisma } from "./prisma";
import type { CapacitySettings, CapacityLeave, CapacityOverride, TenantMembership } from "@prisma/client";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export type CapacityRange = {
  start: string;
  end: string;
};

export type CapacitySettingsPayload = {
  workingHoursPerDay: number;
  workingDays: string[];
  allowOvertime: boolean;
};

export type CapacitySummary = {
  teamUtilisation: number;
  availableHours: number;
  overallocatedPeople: number;
  unassignedWorkHours: number;
  unassignedWorkCount: number;
  atRiskJobs: number;
  totalCapacityHours: number;
  totalAllocatedHours: number;
  totalMembers: number;
  totalActiveJobs: number;
};

export type CapacityMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  capacityHours: number;
  allocatedHours: number;
  utilisation: number;
  availableHours: number;
  activeJobs: number;
  status: "OK" | "NEAR" | "OVER";
  daily: { date: string; capacity: number; allocated: number; leave: number }[];
};

export type CapacityChartPoint = {
  label: string;
  capacity: number;
  allocated: number;
  over: number;
};

export type UnassignedWorkItem = {
  id: string;
  name: string;
  dueDate: string | null;
  hours: number;
  requiredRole: string | null;
  suggested: { id: string; name: string; available: number }[];
};

export type CapacityPayload = {
  range: CapacityRange;
  settings: CapacitySettingsPayload;
  summary: CapacitySummary;
  members: CapacityMember[];
  chart: CapacityChartPoint[];
  unassigned: UnassignedWorkItem[];
};

function toDateOnly(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function getDatesInRange(start: Date, end: Date) {
  const dates: Date[] = [];
  let current = toDateOnly(start);
  const last = toDateOnly(end);
  while (current <= last) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

function getWeekKey(date: Date) {
  const day = date.getUTCDay();
  const diff = (day + 6) % 7; // Monday start
  const monday = addDays(date, -diff);
  return formatDate(monday);
}

function buildSettingsPayload(settings: CapacitySettings | null): CapacitySettingsPayload {
  return {
    workingHoursPerDay: settings?.workingHoursPerDay ?? 8,
    workingDays: (settings?.workingDays ?? "MON,TUE,WED,THU,FRI").split(","),
    allowOvertime: settings?.allowOvertime ?? false
  };
}

function workingDaysCount(workingDays: string[]) {
  return workingDays.length || 5;
}

function isWorkingDay(date: Date, workingDays: string[]) {
  const label = DAY_LABELS[date.getUTCDay()];
  return workingDays.includes(label);
}

function rangeOverlaps(start: Date, end: Date, otherStart?: Date | null, otherEnd?: Date | null) {
  const s = otherStart ? toDateOnly(otherStart) : null;
  const e = otherEnd ? toDateOnly(otherEnd) : null;
  if (s && e) {
    return s <= end && e >= start;
  }
  if (s && !e) {
    return s <= end;
  }
  if (!s && e) {
    return e >= start;
  }
  return true;
}

export async function getCapacityPayload(tenantId: string, range: CapacityRange): Promise<CapacityPayload> {
  const start = parseDate(range.start);
  const end = parseDate(range.end);
  const [memberships, settings, overrides, leaves, jobs, timeEntries] = await Promise.all([
    prisma.tenantMembership.findMany({
      where: { tenantId },
      include: { user: true }
    }),
    prisma.capacitySettings.findUnique({ where: { tenantId } }),
    prisma.capacityOverride.findMany({ where: { tenantId } }),
    prisma.capacityLeave.findMany({ where: { tenantId } }),
    prisma.job.findMany({
      where: { tenantId, status: "ACTIVE" },
      include: { assignments: true }
    }),
    prisma.timeEntry.findMany({
      where: {
        tenantId,
        date: {
          gte: start,
          lte: end
        }
      }
    })
  ]);

  const settingsPayload = buildSettingsPayload(settings);
  const days = getDatesInRange(start, end);
  const workingDayCount = workingDaysCount(settingsPayload.workingDays);

  const overridesByUser = new Map<string, CapacityOverride[]>();
  overrides.forEach((override) => {
    if (!overridesByUser.has(override.userId)) {
      overridesByUser.set(override.userId, []);
    }
    overridesByUser.get(override.userId)!.push(override);
  });

  const leavesByUser = new Map<string, CapacityLeave[]>();
  leaves.forEach((leave) => {
    if (!leavesByUser.has(leave.userId)) {
      leavesByUser.set(leave.userId, []);
    }
    leavesByUser.get(leave.userId)!.push(leave);
  });

  const timeEntriesByUser = new Map<string, { date: string; hours: number }[]>();
  timeEntries.forEach((entry) => {
    const dateKey = formatDate(entry.date);
    const hours = entry.durationMinutes / 60;
    if (!timeEntriesByUser.has(entry.userId)) {
      timeEntriesByUser.set(entry.userId, []);
    }
    timeEntriesByUser.get(entry.userId)!.push({ date: dateKey, hours });
  });

  const memberRows: CapacityMember[] = memberships.map((member) => {
    const userOverrides = overridesByUser.get(member.userId) ?? [];
    const leaveEntries = leavesByUser.get(member.userId) ?? [];
    const daily = days.map((date) => {
      const dateKey = formatDate(date);
      let capacity = 0;
      if (isWorkingDay(date, settingsPayload.workingDays)) {
        const activeOverride = userOverrides.find((override) =>
          rangeOverlaps(date, date, override.startDate, override.endDate)
        );
        const baseHours = activeOverride
          ? activeOverride.weeklyCapacityHours / workingDayCount
          : settingsPayload.workingHoursPerDay;
        capacity = baseHours;
      }

      let leave = 0;
      for (const entry of leaveEntries) {
        if (rangeOverlaps(date, date, entry.startDate, entry.endDate)) {
          leave += entry.hoursPerDay ?? settingsPayload.workingHoursPerDay;
        }
      }

      capacity = Math.max(0, capacity - leave);

      const allocated = (timeEntriesByUser.get(member.userId) ?? [])
        .filter((entry) => entry.date === dateKey)
        .reduce((sum, entry) => sum + entry.hours, 0);

      return { date: dateKey, capacity, allocated, leave };
    });

    const capacityHours = daily.reduce((sum, day) => sum + day.capacity, 0);
    const allocatedHours = daily.reduce((sum, day) => sum + day.allocated, 0);
    const utilisation = capacityHours > 0 ? allocatedHours / capacityHours : 0;
    const availableHours = Math.max(0, capacityHours - allocatedHours);

    const activeJobs = jobs.filter((job) =>
      job.assignments.some((assignment) => assignment.userId === member.userId)
    ).length;

    let status: CapacityMember["status"] = "OK";
    if (utilisation > 1) {
      status = "OVER";
    } else if (utilisation >= 0.8) {
      status = "NEAR";
    }

    return {
      id: member.userId,
      name: member.user.name ?? member.user.email ?? "User",
      email: member.user.email ?? "",
      role: member.role,
      capacityHours,
      allocatedHours,
      utilisation,
      availableHours,
      activeJobs,
      status,
      daily
    };
  });

  const unassignedJobs = jobs.filter((job) => job.assignments.length === 0);
  const summaryUnassignedHours = unassignedJobs.reduce((sum, job) => {
    return sum + (job.budgetMinutes ? job.budgetMinutes / 60 : 0);
  }, 0);

  const suggestedAssignees = (count: number) =>
    [...memberRows]
      .sort((a, b) => b.availableHours - a.availableHours)
      .slice(0, count)
      .map((member) => ({ id: member.id, name: member.name, available: member.availableHours }));

  const unassigned: UnassignedWorkItem[] = unassignedJobs.map((job) => ({
    id: job.id,
    name: job.name,
    dueDate: job.dueDate ? formatDate(job.dueDate) : null,
    hours: job.budgetMinutes ? job.budgetMinutes / 60 : 0,
    requiredRole: null,
    suggested: suggestedAssignees(3)
  }));

  const atRiskJobs = unassignedJobs.filter((job) => {
    if (!job.dueDate) return false;
    return toDateOnly(job.dueDate) <= end;
  }).length;

  const totalCapacity = memberRows.reduce((sum, member) => sum + member.capacityHours, 0);
  const totalAllocated = memberRows.reduce((sum, member) => sum + member.allocatedHours, 0);

  const weeklyChartMap = new Map<string, { capacity: number; allocated: number }>();
  memberRows.forEach((member) => {
    member.daily.forEach((day) => {
      const weekKey = getWeekKey(parseDate(day.date));
      if (!weeklyChartMap.has(weekKey)) {
        weeklyChartMap.set(weekKey, { capacity: 0, allocated: 0 });
      }
      const week = weeklyChartMap.get(weekKey)!;
      week.capacity += day.capacity;
      week.allocated += day.allocated;
    });
  });

  const chart = Array.from(weeklyChartMap.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([week, values]) => ({
      label: week,
      capacity: values.capacity,
      allocated: values.allocated,
      over: Math.max(0, values.allocated - values.capacity)
    }));

  const summary: CapacitySummary = {
    teamUtilisation: totalCapacity > 0 ? totalAllocated / totalCapacity : 0,
    availableHours: Math.max(0, totalCapacity - totalAllocated),
    overallocatedPeople: memberRows.filter((member) => member.utilisation > 1).length,
    unassignedWorkHours: summaryUnassignedHours,
    unassignedWorkCount: unassignedJobs.length,
    atRiskJobs,
    totalCapacityHours: totalCapacity,
    totalAllocatedHours: totalAllocated,
    totalMembers: memberRows.length,
    totalActiveJobs: jobs.length
  };

  return {
    range,
    settings: settingsPayload,
    summary,
    members: memberRows.sort((a, b) => b.utilisation - a.utilisation),
    chart,
    unassigned
  };
}

export function getDefaultRange(offsetWeeks = 0): CapacityRange {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (day + 6) % 7;
  const monday = addDays(toDateOnly(now), -diff + offsetWeeks * 7);
  const sunday = addDays(monday, 6);
  return { start: formatDate(monday), end: formatDate(sunday) };
}
