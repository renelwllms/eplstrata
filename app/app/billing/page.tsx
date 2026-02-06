import { requireTenant } from "../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { getSeatUsage, getTenantBillingContext } from "../../../lib/billing-access";
import { Button } from "../../../components/ui/button";

export default async function BillingPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const seatUsage = await getSeatUsage(user.tenantId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Billing</p>
        <h1 className="font-display text-3xl">Plan & access</h1>
        <p className="text-sm text-ink-700">Manage plan status and seat usage.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-ink-700">Plan</p>
              <p className="text-xl font-semibold">{billing.plan.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-ink-700">Status</p>
              <Badge variant={billing.readOnly ? "danger" : "success"}>{billing.subscription.status}</Badge>
            </div>
            <div>
              <p className="text-xs uppercase text-ink-700">Billing period</p>
              <p className="text-xl font-semibold">{billing.plan.billingPeriod}</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/70 p-4">
            <div>
              <p className="text-sm font-semibold">Seats</p>
              <p className="text-xs text-ink-700">{seatUsage.memberCount} of {seatUsage.seatLimit} seats used</p>
            </div>
            <Button variant="outline">Manage seats</Button>
          </div>
          {billing.readOnly && (
            <div className="mt-4 rounded-2xl bg-rose-100 p-4 text-sm text-rose-700">
              This workspace is read-only due to billing status. Settle payment to resume edits.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from(billing.featureFlags).map((feature) => (
              <div key={feature} className="flex items-center justify-between rounded-2xl bg-white/70 p-3">
                <span className="text-sm font-semibold">{feature}</span>
                <Badge variant="success">Enabled</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
