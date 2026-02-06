import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { TimeEntryForm } from "../../../../components/app/forms/time-entry-form";

export default async function NewTimeEntryPage() {
  const user = await requireTenant();
  const [jobs, tasks] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Time</p>
        <h1 className="font-display text-3xl">New time entry</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Time details</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeEntryForm jobs={jobs} tasks={tasks} />
        </CardContent>
      </Card>
    </div>
  );
}
