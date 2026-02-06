import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { Button } from "../../../components/ui/button";
import { getTenantBillingContext } from "../../../lib/billing-access";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { BulkList } from "../../../components/app/lists/bulk-list";

export default async function ClientsPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const clients = await prisma.client.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Clients</p>
          <h1 className="font-display text-3xl">Client portfolio</h1>
        </div>
        <Button asChild disabled={billing.readOnly}>
          <a href="/app/clients/new">Add client</a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All clients</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkList
            resource="clients"
            emptyText="No clients yet."
            items={clients.map((client) => ({
              id: client.id,
              title: client.name,
              subtitle: client.billingEmail ?? "No billing email",
              meta: client.status,
              href: `/app/clients/${client.id}`
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
