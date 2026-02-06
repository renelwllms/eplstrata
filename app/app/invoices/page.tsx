import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { getTenantBillingContext } from "../../../lib/billing-access";
import { BulkList } from "../../../components/app/lists/bulk-list";

export default async function InvoicesPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const invoices = await prisma.invoice.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    include: { client: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Invoices</p>
          <h1 className="font-display text-3xl">Invoice run</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/app/invoices/templates">Templates</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/app/invoices/hub">Invoice hub</a>
          </Button>
          <Button asChild disabled={billing.readOnly}>
            <a href="/app/invoices/new">Create invoice</a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkList
            resource="invoices"
            emptyText="No invoices yet."
            items={invoices.map((invoice) => ({
              id: invoice.id,
              title: invoice.number,
              subtitle: invoice.client.name,
              meta: `NZ$ ${Number(invoice.total).toFixed(2)} · ${invoice.status}`,
              href: `/app/invoices/${invoice.id}`
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
