import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { DeleteButton } from "../../../../components/app/forms/delete-button";
import { InlineEditPanel } from "../../../../components/app/forms/inline-edit-panel";
import { TimeEntryForm } from "../../../../components/app/forms/time-entry-form";

export default async function TimeEntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const [entry, jobs, tasks] = await Promise.all([
    prisma.timeEntry.findUnique({
      where: { id: id },
      include: { job: true, task: true }
    }),
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Time</p>
          <h1 className="font-display text-3xl">Time entry</h1>
        </div>
        <div className="flex items-center gap-2">
          <DeleteButton
            endpoint={`/api/time-entries/${entry.id}`}
            confirmText="Delete this time entry?"
            redirectTo="/app/time"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-ink-700">
          <p>Date: {entry.date.toISOString().slice(0, 10)}</p>
          <p>Job: {entry.job.name}</p>
          <p>Task: {entry.task.name}</p>
          <p>Duration: {entry.durationMinutes} min</p>
          <p>Billable: {entry.billable ? "Yes" : "No"}</p>
          {entry.notes && <p>Notes: {entry.notes}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit time entry</CardTitle>
        </CardHeader>
        <CardContent>
          <InlineEditPanel label="Edit time entry">
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
          </InlineEditPanel>
        </CardContent>
      </Card>
    </div>
  );
}
