import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { DeleteButton } from "../../../../components/app/forms/delete-button";
import { InlineEditPanel } from "../../../../components/app/forms/inline-edit-panel";
import { LeadForm } from "../../../../components/app/forms/lead-form";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const user = await requireTenant();
  const [lead, stages, owners] = await Promise.all([
    prisma.lead.findUnique({
      where: { id: params.id },
      include: { stage: true, owner: true, activities: true }
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

  if (
    !lead ||
    lead.tenantId !== user.tenantId ||
    (user.role === "STAFF" && lead.ownerUserId !== user.id)
  ) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-ink-700">Lead not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Lead</p>
          <h1 className="font-display text-3xl">{lead.name}</h1>
          <p className="text-sm text-ink-700">{lead.company ?? "No company"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/app/leads">Back to leads</Link>
          </Button>
          <DeleteButton
            endpoint={`/api/leads/${lead.id}`}
            confirmText="Delete this lead?"
            redirectTo="/app/leads"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lead details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-ink-700">
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant={lead.stage.isClosed ? (lead.stage.isWon ? "success" : "default") : "default"}>
                {lead.stage.name}
              </Badge>
              <span>Owner: {lead.owner?.name ?? "Unassigned"}</span>
              {lead.expectedCloseDate && (
                <span>Close: {lead.expectedCloseDate.toISOString().slice(0, 10)}</span>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-ink-500">Email</p>
                <p>{lead.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-ink-500">Phone</p>
                <p>{lead.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-ink-500">Estimated value</p>
                <p>
                  {lead.estimatedValue ? `NZ$ ${Number(lead.estimatedValue).toFixed(2)}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-ink-500">Probability</p>
                <p>{lead.probability ? `${lead.probability}%` : "—"}</p>
              </div>
            </div>
            {lead.notes && (
              <div>
                <p className="text-xs uppercase text-ink-500">Notes</p>
                <p>{lead.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-ink-700">
            <p>Schedule follow-ups and activities for this lead.</p>
            <Button variant="outline" disabled>
              Add activity
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {lead.activities.map((activity) => (
              <div key={activity.id} className="rounded-2xl bg-white/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{activity.title}</p>
                  <Badge variant={activity.completedAt ? "success" : "default"}>
                    {activity.type}
                  </Badge>
                </div>
                {activity.notes && <p className="text-xs text-ink-700">{activity.notes}</p>}
                <p className="text-[11px] text-ink-500">
                  {activity.dueDate ? `Due ${activity.dueDate.toISOString().slice(0, 10)}` : "No due date"}
                </p>
              </div>
            ))}
            {lead.activities.length === 0 && (
              <p className="text-sm text-ink-700">No activities yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit lead</CardTitle>
        </CardHeader>
        <CardContent>
          <InlineEditPanel label="Edit lead">
            <LeadForm
              mode="edit"
              leadId={lead.id}
              stages={stages}
              owners={owners.map((member) => ({
                id: member.userId,
                name: member.user.name,
                email: member.user.email
              }))}
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
          </InlineEditPanel>
        </CardContent>
      </Card>
    </div>
  );
}
