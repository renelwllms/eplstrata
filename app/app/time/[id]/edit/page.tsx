import { prisma } from "../../../../../lib/prisma";
import { requireTenant } from "../../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { TimeEntryForm } from "../../../../../components/app/forms/time-entry-form";

export default async function EditTimeEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const [entry, jobs, tasks] = await Promise.all([
    prisma.timeEntry.findUnique({ where: { id: id } }),
    prisma.job.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    prisma.taskCatalog.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  if (!entry || entry.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Time entry not found.</p>;
  }

  if (user.role === "STAFF" && entry.userId !== user.id) {
    return <p className="text-sm text-ink-700">Time entry not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Time</p>
        <h1 className="font-display text-3xl">Edit time entry</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Time details</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeEntryForm
            mode="edit"
            entryId={entry.id}
            jobs={jobs}
            tasks={tasks}
            initial={{
              jobId: entry.jobId,
              taskCatalogId: entry.taskCatalogId,
              date: entry.date.toISOString().slice(0, 10),
              startTime: entry.startTime ? entry.startTime.toISOString().slice(0, 16) : "",
              endTime: entry.endTime ? entry.endTime.toISOString().slice(0, 16) : "",
              durationMinutes: entry.durationMinutes,
              billable: entry.billable,
              notes: entry.notes
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
