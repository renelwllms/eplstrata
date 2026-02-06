import { prisma } from "../../../../../lib/prisma";
import { requireTenant } from "../../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { LeadForm } from "../../../../../components/app/forms/lead-form";

export default async function EditLeadPage({ params }: { params: { id: string } }) {
  const user = await requireTenant();
  const [lead, stages, owners] = await Promise.all([
    prisma.lead.findUnique({
      where: { id: params.id }
    }),
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

  if (!lead || lead.tenantId !== user.tenantId) {
    return <p className="text-sm text-ink-700">Lead not found.</p>;
  }

  const ownerOptions = owners.map((member) => ({
    id: member.userId,
    name: member.user.name,
    email: member.user.email
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Leads</p>
        <h1 className="font-display text-3xl">Edit lead</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lead details</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm
            mode="edit"
            leadId={lead.id}
            stages={stages}
            owners={ownerOptions}
            initial={{
              name: lead.name,
              company: lead.company,
              stageId: lead.stageId,
              ownerUserId: lead.ownerUserId,
              email: lead.email,
              phone: lead.phone,
              estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : undefined,
              probability: lead.probability ?? undefined,
              expectedCloseDate: lead.expectedCloseDate ? lead.expectedCloseDate.toISOString().slice(0, 10) : "",
              source: lead.source,
              notes: lead.notes
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
