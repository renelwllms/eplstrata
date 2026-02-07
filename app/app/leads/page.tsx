import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { getTenantBillingContext } from "../../../lib/billing-access";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { BulkList } from "../../../components/app/lists/bulk-list";
import { LeadStagePie } from "../../../components/app/leads/lead-stage-pie";
import { leadStagePalette } from "../../../components/app/leads/lead-stage-palette";

export default async function LeadsPage({
  searchParams
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const hasAccess = billing.featureFlags.has("LEADS") || user.platformRole === "SUPER_ADMIN";
  const resolvedParams = await searchParams;
  const view = resolvedParams?.view === "list" ? "list" : "board";

  const [stages, leads] = hasAccess
    ? await Promise.all([
        prisma.leadStage.findMany({
          where: { tenantId: user.tenantId },
          orderBy: { sortOrder: "asc" }
        }),
        prisma.lead.findMany({
          where: {
            tenantId: user.tenantId,
            ...(user.role === "STAFF" ? { ownerUserId: user.id } : {})
          },
          include: { stage: true, owner: true },
          orderBy: { createdAt: "desc" }
        })
      ])
    : [[], []];

  const stageMap = new Map(stages.map((stage) => [stage.id, stage]));
  const grouped = stages.map((stage) => ({
    stage,
    leads: leads.filter((lead) => lead.stageId === stage.id)
  }));
  const stageSummary = grouped.map(({ stage, leads: stageLeads }) => ({
    name: stage.name,
    value: stageLeads.length
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Leads</p>
          <h1 className="font-display text-3xl">Pipeline manager</h1>
          <p className="text-sm text-ink-700">Track and qualify new business.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/app/leads/settings">Stages & templates</Link>
          </Button>
          <Button asChild disabled={billing.readOnly}>
            <a href="/app/leads/new">Create lead</a>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant={view === "board" ? "primary" : "outline"} size="sm">
          <Link href="/app/leads?view=board">Pipeline board</Link>
        </Button>
        <Button asChild variant={view === "list" ? "primary" : "outline"} size="sm">
          <Link href="/app/leads?view=list">List view</Link>
        </Button>
      </div>

      {!hasAccess && (
        <Card>
          <CardContent>
            <p className="text-sm text-ink-700">
              Lead manager is not available on your current plan.
            </p>
          </CardContent>
        </Card>
      )}

      {hasAccess && view === "board" ? (
        <div className="space-y-6">
          <Card className="border-white/60 bg-white/90 shadow-soft">
            <CardHeader>
              <CardTitle>Pipeline distribution</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 grid-cols-2 items-start">
              <div className="flex items-center justify-center">
                <LeadStagePie data={stageSummary} />
              </div>
              <div className="space-y-3">
                {grouped.map(({ stage, leads: stageLeads }, index) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between rounded-2xl border border-sand-100 bg-sand-50 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: leadStagePalette[index % leadStagePalette.length] }}
                      />
                      <span className="font-semibold text-ink-700">{stage.name}</span>
                    </div>
                    <Badge variant={stage.isClosed ? (stage.isWon ? "success" : "default") : "default"}>
                      {stageLeads.length}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            {grouped.map(({ stage, leads: stageLeads }) => (
              <Card key={stage.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{stage.name}</CardTitle>
                    <Badge variant={stage.isClosed ? (stage.isWon ? "success" : "default") : "default"}>
                      {stageLeads.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/app/leads/${lead.id}`}
                      className="block rounded-2xl border border-white/60 bg-white/70 p-4 transition hover:shadow-sm"
                    >
                      <p className="text-sm font-semibold">{lead.name}</p>
                      <p className="text-xs text-ink-700">{lead.company ?? "No company"}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-ink-600">
                        <span>{lead.owner?.name ?? "Unassigned"}</span>
                        <span>
                          {lead.estimatedValue ? `NZ$ ${Number(lead.estimatedValue).toFixed(2)}` : "No value"}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-xs text-ink-700">No leads in this stage.</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {stages.length === 0 && (
              <Card>
                <CardContent>
                  <p className="text-sm text-ink-700">No lead stages configured yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        hasAccess && (
          <Card>
            <CardHeader>
              <CardTitle>All leads</CardTitle>
            </CardHeader>
            <CardContent>
              <BulkList
                resource="leads"
                emptyText="No leads yet."
                items={leads.map((lead) => ({
                  id: lead.id,
                  title: lead.name,
                  subtitle: lead.company ?? "No company",
                  meta: `${stageMap.get(lead.stageId)?.name ?? "Stage"} · ${
                    lead.estimatedValue ? `NZ$ ${Number(lead.estimatedValue).toFixed(2)}` : "No value"
                  }`,
                  href: `/app/leads/${lead.id}`
                }))}
              />
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
