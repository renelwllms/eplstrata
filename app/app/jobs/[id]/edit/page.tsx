import { prisma } from "../../../../../lib/prisma";
import { requireTenant } from "../../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { JobForm } from "../../../../../components/app/forms/job-form";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTenant();
  const [job, clients, members] = await Promise.all([
    prisma.job.findUnique({
      where: { id: id },
      select: {
        id: true,
        tenantId: true,
        jobNumber: true,
        clientId: true,
        name: true,
        status: true,
        startDate: true,
        dueDate: true,
        budgetMinutes: true,
        assignments: { select: { userId: true } }
      }
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
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Jobs</p>
        <h1 className="font-display text-3xl">Edit job</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
