import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { LeadForm } from "../../../../components/app/forms/lead-form";

export default async function NewLeadPage() {
  const user = await requireTenant();
  const [stages, owners] = await Promise.all([
    prisma.leadStage.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true }
    }),
    prisma.tenantMembership.findMany({
      where: { tenantId: user.tenantId },
      include: { user: true }
    })
  ]);

  const ownerOptions = owners.map((member) => ({
    id: member.userId,
    name: member.user.name,
    email: member.user.email
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Leads</p>
        <h1 className="font-display text-3xl">New lead</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lead details</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm stages={stages} owners={ownerOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
