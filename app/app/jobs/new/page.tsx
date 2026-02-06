import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { JobForm } from "../../../../components/app/forms/job-form";

export default async function NewJobPage() {
  const user = await requireTenant();
  const [clients, members] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Jobs</p>
        <h1 className="font-display text-3xl">New job</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm
            clients={clients}
            members={members.map((member) => ({
              id: member.userId,
              name: member.user.name ?? member.user.email,
              role: member.role
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
