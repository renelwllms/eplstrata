import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";

export default async function JobSchedulePage() {
  const user = await requireTenant();
  const milestones = await prisma.jobMilestone.findMany({
    where: { tenantId: user.tenantId },
    include: { job: true },
    orderBy: { dueDate: "asc" },
    take: 50
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Jobs</p>
        <h1 className="font-display text-3xl">Schedule manager</h1>
        <p className="text-sm text-ink-700">Upcoming milestones and deadlines.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4">
                <div>
                  <p className="text-sm font-semibold">{milestone.name}</p>
                  <p className="text-xs text-ink-700">{milestone.job.name}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-700">
                  <span>{milestone.dueDate ? milestone.dueDate.toISOString().slice(0, 10) : "No date"}</span>
                  <Badge variant={milestone.isComplete ? "success" : "default"}>
                    {milestone.isComplete ? "Complete" : "Open"}
                  </Badge>
                </div>
              </div>
            ))}
            {milestones.length === 0 && (
              <p className="text-sm text-ink-700">No milestones yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
