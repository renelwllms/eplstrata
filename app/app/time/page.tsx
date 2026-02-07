import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { timeEntryService } from "../../../lib/services/time-entries";
import { getWeekRange, formatDate } from "../../../lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { TimeEntryModal } from "../../../components/app/time-entry-modal";
import { Button } from "../../../components/ui/button";
import { getTenantBillingContext } from "../../../lib/billing-access";
import { OfflineQueueBanner } from "../../../components/app/offline-time-queue";
import { BulkList } from "../../../components/app/lists/bulk-list";

export default async function TimePage({
  searchParams
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const resolvedParams = await searchParams;
  const date = resolvedParams?.date ?? formatDate(new Date());
  const service = timeEntryService(user.tenantId, prisma);
  const summary = await service.weekSummary(date, user.id, user.role);
  const { start, end } = getWeekRange(date);

  const jobs = await prisma.job.findMany({
    where: { tenantId: user.tenantId },
    select: { id: true, name: true }
  });

  const tasks = await prisma.taskCatalog.findMany({
    where: { tenantId: user.tenantId },
    select: { id: true, name: true }
  });

  const days = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    return formatDate(day);
  });

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Time</p>
            <h1 className="font-display text-3xl">Weekly timesheet</h1>
            <p className="text-sm text-ink-700">
              {formatDate(start)} → {formatDate(end)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Daily view
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/app/time/new">New entry</a>
            </Button>
            <TimeEntryModal jobs={jobs} tasks={tasks} disabled={billing.readOnly} />
          </div>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Week overview</CardTitle>
        </CardHeader>
        <CardContent>
          <OfflineQueueBanner disabled={billing.readOnly} />
          <div className="grid gap-2 sm:grid-cols-7">
            {days.map((day) => (
              <div key={day} className="rounded-2xl bg-white/70 p-4">
                <p className="text-xs uppercase text-ink-700">{day}</p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.totalsByDay[day] ? `${summary.totalsByDay[day]} min` : "—"}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-ink-900 px-5 py-4 text-sand-50">
            <span className="text-sm uppercase tracking-[0.2em]">Week total</span>
            <span className="text-2xl font-semibold">{summary.weekTotal} min</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkList
            resource="time-entries"
            emptyText="No entries for this week."
            items={summary.entries.map((entry) => ({
              id: entry.id,
              title: entry.notes ?? "Time entry",
              subtitle: entry.date.toISOString().slice(0, 10),
              meta: `${entry.durationMinutes} min`,
              href: `/app/time/${entry.id}`
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
