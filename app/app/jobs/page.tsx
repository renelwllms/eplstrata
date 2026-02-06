import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { getTenantBillingContext } from "../../../lib/billing-access";
import { BulkList } from "../../../components/app/lists/bulk-list";

export default async function JobsPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const jobs = await prisma.job.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: { client: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Jobs</p>
          <h1 className="font-display text-3xl">Live workboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/app/jobs/schedule">Schedule</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/app/jobs/capacity">Capacity</a>
          </Button>
          <Button asChild disabled={billing.readOnly}>
            <a href="/app/jobs/new">Create job</a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkList
            resource="jobs"
            emptyText="No jobs yet."
            items={jobs.map((job) => ({
              id: job.id,
              title: job.name,
              subtitle: job.client.name,
              meta: `#${job.jobNumber} · ${job.status}`,
              href: `/app/jobs/${job.id}`
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
