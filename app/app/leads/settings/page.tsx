import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { getTenantBillingContext } from "../../../../lib/billing-access";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

export default async function LeadSettingsPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const hasAccess = billing.featureFlags.has("LEADS") || user.platformRole === "SUPER_ADMIN";
  const [stages, templates] = await Promise.all([
    hasAccess
      ? prisma.leadStage.findMany({
          where: { tenantId: user.tenantId },
          orderBy: { sortOrder: "asc" }
        })
      : [],
    hasAccess
      ? prisma.leadTemplate.findMany({
          where: { tenantId: user.tenantId },
          orderBy: { createdAt: "desc" }
        })
      : []
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Leads</p>
          <h1 className="font-display text-3xl">Stages & templates</h1>
          <p className="text-sm text-ink-700">Configure your lead pipeline and reusable templates.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/leads?view=board">Back to leads</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead stages</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasAccess && (
            <p className="text-sm text-ink-700">
              Lead manager is not available on your current plan.
            </p>
          )}
          {hasAccess && (
          <div className="grid gap-3">
            {stages.map((stage) => (
              <div key={stage.id} className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
                <div>
                  <p className="text-sm font-semibold">{stage.name}</p>
                  <p className="text-xs text-ink-700">Order {stage.sortOrder}</p>
                </div>
                <span className="text-xs uppercase text-ink-700">
                  {stage.isClosed ? (stage.isWon ? "Won" : "Closed") : "Open"}
                </span>
              </div>
            ))}
            {stages.length === 0 && (
              <p className="text-sm text-ink-700">No stages configured yet.</p>
            )}
          </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button disabled={billing.readOnly}>Add stage</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead templates</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasAccess && (
            <p className="text-sm text-ink-700">
              Lead templates are not available on your current plan.
            </p>
          )}
          {hasAccess && (
          <div className="grid gap-3">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
                <p className="text-sm font-semibold">{template.name}</p>
                <span className="text-xs text-ink-700">
                  {template.createdAt.toISOString().slice(0, 10)}
                </span>
              </div>
            ))}
            {templates.length === 0 && (
              <p className="text-sm text-ink-700">No templates yet.</p>
            )}
          </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" disabled={billing.readOnly}>
              New template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
