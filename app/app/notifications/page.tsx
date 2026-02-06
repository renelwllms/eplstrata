import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { getTenantBillingContext } from "../../../lib/billing-access";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { markNotificationRead } from "./actions";

export default async function NotificationsPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const hasAccess = billing.featureFlags.has("NOTIFICATIONS") || user.platformRole === "SUPER_ADMIN";

  const notifications = hasAccess
    ? await prisma.notification.findMany({
        where: { tenantId: user.tenantId, userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Notifications</p>
        <h1 className="font-display text-3xl">Your alerts</h1>
        <p className="text-sm text-ink-700">System updates and workflow alerts.</p>
      </div>

      {!hasAccess && (
        <Card>
          <CardContent>
            <p className="text-sm text-ink-700">
              Notifications are not available on your current plan.
            </p>
          </CardContent>
        </Card>
      )}

      {hasAccess && (
        <Card>
          <CardHeader>
            <CardTitle>Recent notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {notifications.map((note) => (
                <div
                  key={note.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 ${
                    note.readAt ? "bg-white/60" : "bg-emerald-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{note.title}</p>
                    {note.body && <p className="text-xs text-ink-700">{note.body}</p>}
                    <p className="text-[11px] text-ink-500">
                      {note.createdAt.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  {!note.readAt && (
                    <form action={markNotificationRead}>
                      <input type="hidden" name="id" value={note.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Mark read
                      </Button>
                    </form>
                  )}
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-ink-700">No notifications yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
