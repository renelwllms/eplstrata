import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { getTenantBillingContext } from "../../../lib/billing-access";
import { BulkList } from "../../../components/app/lists/bulk-list";

export default async function QuotesPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const quotes = await prisma.quote.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: { client: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Quotes</p>
          <h1 className="font-display text-3xl">Quote pipeline</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/app/quotes/templates">Templates</a>
          </Button>
          <Button asChild disabled={billing.readOnly}>
            <a href="/app/quotes/new">Create quote</a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkList
            resource="quotes"
            emptyText="No quotes yet."
            items={quotes.map((quote) => ({
              id: quote.id,
              title: quote.number,
              subtitle: quote.client.name,
              meta: `NZ$ ${Number(quote.total).toFixed(2)} · ${quote.status}`,
              href: `/app/quotes/${quote.id}`
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
