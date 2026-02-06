import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";
import { getTenantBillingContext } from "../../../../lib/billing-access";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";

export default async function InvoiceHubPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const hasAccess = billing.featureFlags.has("INVOICES_ENHANCED") || user.platformRole === "SUPER_ADMIN";

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Invoices</p>
        <h1 className="font-display text-3xl">Invoice hub</h1>
        <Card>
          <CardContent>
            <p className="text-sm text-ink-700">
              Invoice hub is not available on your current plan.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [overdueCount, sentCount, paidCount] = await Promise.all([
    prisma.invoice.count({ where: { tenantId: user.tenantId, status: "OVERDUE" } }),
    prisma.invoice.count({ where: { tenantId: user.tenantId, status: "SENT" } }),
    prisma.invoice.count({ where: { tenantId: user.tenantId, status: "PAID" } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Invoices</p>
        <h1 className="font-display text-3xl">Invoice hub</h1>
        <p className="text-sm text-ink-700">Cashflow visibility and ageing overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{overdueCount}</span>
            <Badge variant={overdueCount > 0 ? "danger" : "success"}>Overdue</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sent</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{sentCount}</span>
            <Badge variant="default">Sent</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paid</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{paidCount}</span>
            <Badge variant="success">Paid</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
