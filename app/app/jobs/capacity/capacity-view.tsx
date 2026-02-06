"use client";

import { useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import type { CapacityPayload } from "../../../../lib/capacity";

const rangePresets = [
  { id: "this-week", label: "This Week", offset: 0 },
  { id: "next-week", label: "Next Week", offset: 1 }
];

function formatHours(value: number) {
  return `${value.toFixed(1)}h`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function CircularMetric({
  label,
  value,
  total,
  footer,
  color
}: {
  label: string;
  value: number;
  total: number;
  footer?: string;
  color: string;
}) {
  const safeTotal = total > 0 ? total : 1;
  const filled = Math.min(value, safeTotal);
  const remaining = Math.max(0, safeTotal - filled);
  const percent = filled / safeTotal;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-3">
          <div className="h-[90px] w-[90px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "value", value: filled },
                    { name: "remaining", value: remaining }
                  ]}
                  innerRadius={26}
                  outerRadius={40}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={color} />
                  <Cell fill="#E5E7EB" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xl font-semibold text-ink-900">
              {formatPercent(percent)}
            </p>
            <p className="text-xs text-ink-500">{footer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CapacityView({ initialData }: { initialData: CapacityPayload }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("All Teams");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: initialData.range.start,
    end: initialData.range.end
  });

  const roles = useMemo(() => {
    const list = new Set<string>();
    data.members.forEach((member) => list.add(member.role));
    return ["All Teams", ...Array.from(list)];
  }, [data.members]);

  const filteredMembers = useMemo(() => {
    if (selectedRole === "All Teams") {
      return data.members;
    }
    return data.members.filter((member) => member.role === selectedRole);
  }, [data.members, selectedRole]);

  const filteredSummary = useMemo(() => {
    const totalCapacity = filteredMembers.reduce((sum, member) => sum + member.capacityHours, 0);
    const totalAllocated = filteredMembers.reduce((sum, member) => sum + member.allocatedHours, 0);
    return {
      teamUtilisation: totalCapacity > 0 ? totalAllocated / totalCapacity : 0,
      availableHours: Math.max(0, totalCapacity - totalAllocated),
      overallocatedPeople: filteredMembers.filter((member) => member.utilisation > 1).length,
      totalCapacity,
      totalAllocated,
      totalMembers: filteredMembers.length
    };
  }, [filteredMembers]);

  const selected = filteredMembers.find((member) => member.id === selectedMember) ?? filteredMembers[0];

  const chartData = useMemo(() => {
    const capacity = filteredSummary.totalCapacity;
    const allocated = filteredSummary.totalAllocated;
    const within = Math.min(capacity, allocated);
    const remaining = Math.max(0, capacity - allocated);
    const over = Math.max(0, allocated - capacity);
    return [
      { name: "Allocated", value: within, color: "#2D6CDF" },
      { name: "Remaining", value: remaining, color: "#A4C7F5" },
      { name: "Over", value: over, color: "#F97316" }
    ];
  }, [filteredSummary]);

  const availabilityChart = useMemo(() => {
    const capacity = filteredSummary.totalCapacity;
    const allocated = filteredSummary.totalAllocated;
    const available = Math.max(0, capacity - allocated);
    return [
      { name: "Allocated", value: allocated, color: "#2D6CDF" },
      { name: "Available", value: available, color: "#22C55E" }
    ];
  }, [filteredSummary]);

  const unassignedChart = useMemo(() => {
    const total = data.summary.totalActiveJobs || 1;
    const unassigned = data.summary.unassignedWorkCount;
    const assigned = Math.max(0, total - unassigned);
    return [
      { name: "Unassigned", value: unassigned, color: "#F97316" },
      { name: "Assigned", value: assigned, color: "#A4C7F5" }
    ];
  }, [data.summary]);

  const refresh = async (range?: { start: string; end: string }) => {
    setLoading(true);
    const target = range ?? data.range;
    const response = await fetch(`/api/capacity?start=${target.start}&end=${target.end}`);
    const payload = await response.json();
    setData(payload.data);
    setCustomRange(target);
    setLoading(false);
  };

  const applyCustomRange = () => {
    refresh(customRange);
  };

  const saveSettings = async (settings: { workingHoursPerDay: number; workingDays: string[]; allowOvertime: boolean }) => {
    await fetch("/api/capacity/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workingHoursPerDay: settings.workingHoursPerDay,
        workingDays: settings.workingDays.join(","),
        allowOvertime: settings.allowOvertime
      })
    });
    await refresh();
    setSettingsOpen(false);
  };

  const saveOverride = async (payload: { userId: string; weeklyCapacityHours: number; role?: string; startDate?: string; endDate?: string }) => {
    await fetch("/api/capacity/overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    await refresh();
  };

  const saveLeave = async (payload: { userId: string; startDate: string; endDate: string; hoursPerDay?: number }) => {
    await fetch("/api/capacity/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    await refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Jobs</p>
          <h1 className="font-display text-3xl">Capacity planning</h1>
          <p className="text-sm text-ink-700">Track staff load, availability, and job coverage.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {rangePresets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => {
                const base = new Date();
                const day = base.getUTCDay();
                const diff = (day + 6) % 7;
                const monday = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - diff + preset.offset * 7));
                const sunday = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6));
                refresh({ start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) });
              }}
            >
              {preset.label}
            </Button>
          ))}
          <div className="flex items-center gap-2 rounded-full border border-sand-200 bg-white px-3 py-1 text-xs">
            <input
              type="date"
              value={customRange.start}
              onChange={(event) => setCustomRange((prev) => ({ ...prev, start: event.target.value }))}
              className="bg-transparent text-xs text-ink-900"
            />
            <span className="text-ink-400">to</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(event) => setCustomRange((prev) => ({ ...prev, end: event.target.value }))}
              className="bg-transparent text-xs text-ink-900"
            />
            <Button size="sm" variant="ghost" onClick={applyCustomRange}>
              Apply
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <CircularMetric
          label="Team Utilisation"
          value={filteredSummary.totalAllocated}
          total={filteredSummary.totalCapacity}
          footer={`${formatHours(filteredSummary.totalAllocated)} / ${formatHours(filteredSummary.totalCapacity)}`}
          color="#2D6CDF"
        />
        <CircularMetric
          label="Available Hours"
          value={filteredSummary.availableHours}
          total={filteredSummary.totalCapacity}
          footer={`${formatHours(filteredSummary.availableHours)} free`}
          color="#22C55E"
        />
        <CircularMetric
          label="Overallocated People"
          value={filteredSummary.overallocatedPeople}
          total={filteredSummary.totalMembers || 1}
          footer={`${filteredSummary.overallocatedPeople} of ${filteredSummary.totalMembers}`}
          color="#F97316"
        />
        <CircularMetric
          label="At-Risk Jobs"
          value={data.summary.atRiskJobs}
          total={data.summary.totalActiveJobs || 1}
          footer={`${data.summary.atRiskJobs} of ${data.summary.totalActiveJobs}`}
          color="#EF4444"
        />
        <CircularMetric
          label="Unassigned Work"
          value={data.summary.unassignedWorkCount}
          total={data.summary.totalActiveJobs || 1}
          footer={`${data.summary.unassignedWorkCount} jobs`}
          color="#6366F1"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedRole === role ? "bg-ink-900 text-white" : "bg-sand-100 text-ink-700"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="soft" size="sm">
              Capacity settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogTitle>Capacity rules</DialogTitle>
            <DialogDescription>Define working hours and days for capacity calculations.</DialogDescription>
            <CapacitySettingsForm settings={data.settings} onSave={saveSettings} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team utilisation</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] p-4">
            <div className="flex h-full flex-col items-center justify-center gap-3 md:flex-row">
              <div className="h-[160px] w-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      innerRadius={56}
                      outerRadius={82}
                      paddingAngle={2}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatHours(Number(value ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-sm text-ink-700">
                {chartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="font-semibold text-ink-900">{entry.name}</span>
                    <span>{formatHours(entry.value)}</span>
                  </div>
                ))}
                <div className="pt-2 text-xs text-ink-500">
                  {formatPercent(filteredSummary.teamUtilisation)} utilised
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability split</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] p-4">
            <div className="flex h-full flex-col items-center justify-center gap-3 md:flex-row">
              <div className="h-[160px] w-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={availabilityChart}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={76}
                      paddingAngle={2}
                    >
                      {availabilityChart.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatHours(Number(value ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-sm text-ink-700">
                {availabilityChart.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="font-semibold text-ink-900">{entry.name}</span>
                    <span>{formatHours(entry.value)}</span>
                  </div>
                ))}
                <div className="pt-2 text-xs text-ink-500">
                  {formatHours(filteredSummary.availableHours)} available
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>People workload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-auto rounded-2xl border border-sand-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sand-50 text-xs uppercase text-ink-500">
                <tr>
                  <th className="px-4 py-3">Staff member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Allocated</th>
                  <th className="px-4 py-3">Utilisation</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Active jobs</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className={`border-t border-sand-100 ${selectedMember === member.id ? "bg-sand-50" : "bg-white"}`}
                  >
                    <td className="px-4 py-3">
                      <button
                        className="text-left font-semibold text-ink-900"
                        onClick={() => setSelectedMember(member.id)}
                      >
                        {member.name}
                      </button>
                      <p className="text-xs text-ink-500">{member.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{member.role}</td>
                    <td className="px-4 py-3 text-ink-700">{formatHours(member.capacityHours)}</td>
                    <td className="px-4 py-3 text-ink-700">{formatHours(member.allocatedHours)}</td>
                    <td className="px-4 py-3 text-ink-700">{formatPercent(member.utilisation)}</td>
                    <td className="px-4 py-3 text-ink-700">{formatHours(member.availableHours)}</td>
                    <td className="px-4 py-3 text-ink-700">{member.activeJobs}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          member.status === "OVER"
                            ? "bg-red-100 text-red-700"
                            : member.status === "NEAR"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {member.status === "OVER" ? "Overloaded" : member.status === "NEAR" ? "Near cap" : "OK"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="ghost">View schedule</Button>
                        <AdjustCapacityDialog member={member} onSave={saveOverride} />
                        <AddLeaveDialog member={member} onSave={saveLeave} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected ? (
            <div className="rounded-2xl border border-sand-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{selected.name}</p>
                  <p className="text-xs text-ink-500">Availability timeline</p>
                </div>
                <span className="text-xs text-ink-500">{data.range.start} → {data.range.end}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                {selected.daily.map((day) => {
                  const total = day.capacity;
                  const allocated = day.allocated;
                  const leave = day.leave;
                  const free = Math.max(0, total - allocated);
                  return (
                    <div key={day.date} className="rounded-xl bg-sand-50 p-3">
                      <p className="text-xs font-semibold text-ink-700">{day.date}</p>
                      <div className="mt-2 space-y-1 text-xs text-ink-600">
                        <div className="flex items-center justify-between">
                          <span>Assigned</span>
                          <span>{formatHours(allocated)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Leave</span>
                          <span>{formatHours(leave)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Free</span>
                          <span>{formatHours(free)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {loading ? <p className="text-sm text-ink-600">Refreshing data…</p> : null}
    </div>
  );
}

function CapacitySettingsForm({
  settings,
  onSave
}: {
  settings: { workingHoursPerDay: number; workingDays: string[]; allowOvertime: boolean };
  onSave: (payload: { workingHoursPerDay: number; workingDays: string[]; allowOvertime: boolean }) => void;
}) {
  const [hoursPerDay, setHoursPerDay] = useState(settings.workingHoursPerDay);
  const [workingDays, setWorkingDays] = useState(settings.workingDays);
  const [allowOvertime, setAllowOvertime] = useState(settings.allowOvertime);

  const toggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
    );
  };

  return (
    <div className="mt-4 space-y-4">
      <label className="block text-sm font-semibold text-ink-900">
        Working hours per day
        <input
          type="number"
          min={1}
          value={hoursPerDay}
          onChange={(event) => setHoursPerDay(Number(event.target.value))}
          className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2 text-sm"
        />
      </label>
      <div>
        <p className="text-sm font-semibold text-ink-900">Working days</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            "MON",
            "TUE",
            "WED",
            "THU",
            "FRI",
            "SAT",
            "SUN"
          ].map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                workingDays.includes(day) ? "bg-ink-900 text-white" : "bg-sand-100 text-ink-700"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={allowOvertime}
          onChange={(event) => setAllowOvertime(event.target.checked)}
        />
        Allow overtime
      </label>
      <Button
        size="sm"
        onClick={() => onSave({ workingHoursPerDay: hoursPerDay, workingDays, allowOvertime })}
      >
        Save settings
      </Button>
    </div>
  );
}

function AdjustCapacityDialog({
  member,
  onSave
}: {
  member: { id: string; name: string; role: string };
  onSave: (payload: { userId: string; weeklyCapacityHours: number; role?: string; startDate?: string; endDate?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [weeklyCapacity, setWeeklyCapacity] = useState(40);
  const [role, setRole] = useState(member.role);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Adjust capacity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>Adjust capacity</DialogTitle>
        <DialogDescription>Override weekly capacity or role for {member.name}.</DialogDescription>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold text-ink-900">
            Weekly capacity hours
            <input
              type="number"
              min={1}
              value={weeklyCapacity}
              onChange={(event) => setWeeklyCapacity(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold text-ink-900">
            Role / team
            <input
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink-900">
              Start date
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-ink-900">
              End date
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              await onSave({
                userId: member.id,
                weeklyCapacityHours: weeklyCapacity,
                role,
                startDate: startDate || undefined,
                endDate: endDate || undefined
              });
              setOpen(false);
            }}
          >
            Save override
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddLeaveDialog({
  member,
  onSave
}: {
  member: { id: string; name: string };
  onSave: (payload: { userId: string; startDate: string; endDate: string; hoursPerDay?: number }) => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState<number | "">("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          Add leave
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>Add leave</DialogTitle>
        <DialogDescription>Log leave so capacity is reduced for {member.name}.</DialogDescription>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold text-ink-900">
            Start date
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold text-ink-900">
            End date
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold text-ink-900">
            Hours per day (optional)
            <input
              type="number"
              min={1}
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value ? Number(event.target.value) : "")}
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2 text-sm"
            />
          </label>
          <Button
            size="sm"
            onClick={() =>
              onSave({
                userId: member.id,
                startDate,
                endDate,
                hoursPerDay: hoursPerDay === "" ? undefined : hoursPerDay
              })
            }
          >
            Save leave
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
