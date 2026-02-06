import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { getTenantBillingContext } from "../../../../lib/billing-access";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

export default async function QuoteTemplatesPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const hasAccess = billing.featureFlags.has("QUOTES_ENHANCED") || user.platformRole === "SUPER_ADMIN";

  const templates = hasAccess
    ? await prisma.quoteTemplate.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: "desc" }
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Quotes</p>
        <h1 className="font-display text-3xl">Quote templates</h1>
        <p className="text-sm text-ink-700">Design reusable layouts for your quotes.</p>
      </div>

      {!hasAccess && (
        <Card>
          <CardContent>
            <p className="text-sm text-ink-700">
              Quote templates are not available on your current plan.
            </p>
          </CardContent>
        </Card>
      )}

      {hasAccess && (
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
            {templates.map((template) => (
              <a
                key={template.id}
                href={`/app/quotes/templates/${template.id}`}
                className="flex items-center justify-between rounded-2xl bg-white/70 p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{template.name}</p>
                  <p className="text-xs text-ink-700">{template.layout}</p>
                </div>
                <span className="text-xs text-ink-700">
                  {template.createdAt.toISOString().slice(0, 10)}
                </span>
              </a>
            ))}
              {templates.length === 0 && (
                <p className="text-sm text-ink-700">No templates yet.</p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button disabled={billing.readOnly}>New template</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
