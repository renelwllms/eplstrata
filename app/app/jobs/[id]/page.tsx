import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { DeleteButton } from "../../../../components/app/forms/delete-button";
import { InlineEditPanel } from "../../../../components/app/forms/inline-edit-panel";
import { JobForm } from "../../../../components/app/forms/job-form";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const [job, clients, members] = await Promise.all([
    prisma.job.findUnique({
      where: { id: id },
      include: { client: true, milestones: true, assignments: true }
    }),
    prisma.client.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    prisma.tenantMembership.findMany({
      where: { tenantId: user.tenantId },
      include: { user: true },
      orderBy: { user: { name: "asc" } }
    })
  ]);

  if (!job || job.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Job not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Jobs</p>
          <h1 className="font-display text-3xl">{job.name}</h1>
          <p className="text-sm text-ink-700">{job.client.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <DeleteButton
            endpoint={`/api/jobs/${job.id}`}
            confirmText="Delete this job?"
            redirectTo="/app/jobs"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-ink-700">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={job.status === "ACTIVE" ? "success" : "default"}>{job.status}</Badge>
            <span>Job #{job.jobNumber}</span>
            <span>Budget: {job.budgetMinutes ? `${job.budgetMinutes} min` : "No budget"}</span>
            <span>Due: {job.dueDate ? job.dueDate.toISOString().slice(0, 10) : "TBD"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {job.milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
                <div>
                  <p className="text-sm font-semibold">{milestone.name}</p>
                  <p className="text-xs text-ink-700">{milestone.dueDate ? milestone.dueDate.toISOString().slice(0, 10) : "No date"}</p>
                </div>
                <Badge variant={milestone.isComplete ? "success" : "default"}>
                  {milestone.isComplete ? "Complete" : "Open"}
                </Badge>
              </div>
            ))}
            {job.milestones.length === 0 && (
              <p className="text-sm text-ink-700">No milestones yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit job</CardTitle>
        </CardHeader>
        <CardContent>
          <InlineEditPanel label="Edit job">
            <JobForm
              mode="edit"
              jobId={job.id}
              clients={clients}
              members={members.map((member) => ({
                id: member.userId,
                name: member.user.name ?? member.user.email,
                role: member.role
              }))}
              initial={{
                jobNumber: job.jobNumber,
                clientId: job.clientId,
                name: job.name,
                status: job.status,
                startDate: job.startDate ? job.startDate.toISOString().slice(0, 10) : "",
                dueDate: job.dueDate ? job.dueDate.toISOString().slice(0, 10) : "",
                budgetMinutes: job.budgetMinutes ?? undefined,
                assigneeIds: job.assignments.map((assignment) => assignment.userId)
              }}
            />
          </InlineEditPanel>
        </CardContent>
      </Card>
    </div>
  );
}
