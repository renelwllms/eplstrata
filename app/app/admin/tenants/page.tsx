import { prisma } from "../../../../lib/prisma";
import { requireSuperAdmin } from "../../../../lib/session";
import { clearImpersonation, createAdminTenant, impersonateTenant, updateTenantStatus } from "./actions";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { AdminTenantCreateForm } from "./admin-tenant-create-form";
import { TenantOnboardingWizard } from "./tenant-wizard";

export default async function AdminTenantsPage() {
  const user = await requireSuperAdmin();

  const [tenants, plans, impersonation, adminTenant] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: true }
        },
        _count: { select: { memberships: true } }
      }
    }),
    prisma.plan.findMany({ orderBy: { priceCents: "asc" } }),
    prisma.adminImpersonation.findUnique({
      where: { adminUserId: user.id },
      include: { tenant: true }
    }),
    prisma.tenant.findFirst({ where: { name: "EdgePoint Admin" } })
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-ink-500">
            Admin
          </p>
          <h1 className="text-3xl font-semibold text-ink-900">Tenant control</h1>
          <p className="text-sm text-ink-500">
            Impersonate a tenant to diagnose issues or validate flows.
          </p>
        </div>
        {impersonation && (
          <form action={clearImpersonation}>
            <Button type="submit" variant="outline">
              Clear impersonation
            </Button>
          </form>
        )}
      </div>

      {impersonation && (
        <Card className="flex items-center justify-between gap-4 border-amber-200 bg-amber-50 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
              Active impersonation
            </p>
            <p className="text-base font-semibold text-ink-900">
              {impersonation.tenant.name}
            </p>
          </div>
          <Button asChild variant="soft">
            <a href="/app/dashboard">Go to dashboard</a>
          </Button>
        </Card>
      )}

      {!adminTenant && (
        <Card className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
              EdgePoint Admin tenant
            </p>
            <p className="text-sm text-ink-500">
              Create a dedicated internal tenant for super admin workflows.
            </p>
          </div>
          <form action={createAdminTenant}>
            <Button type="submit">Create admin tenant</Button>
          </form>
        </Card>
      )}

      <AdminTenantCreateForm plans={plans} />
      <TenantOnboardingWizard plans={plans} />

      <div className="grid gap-4">
        {tenants.map((tenant) => {
          const subscription = tenant.subscriptions[0];
          const isActive = impersonation?.tenantId === tenant.id;

          return (
            <Card key={tenant.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-lg font-semibold text-ink-900">{tenant.name}</p>
                <p className="text-sm text-ink-500">
                  {subscription?.plan?.name ?? "No plan"} · {subscription?.status ?? "No subscription"}
                </p>
                <p className="text-xs text-ink-400">
                  Members: {tenant._count.memberships}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={updateTenantStatus} className="flex items-center gap-2">
                  <input type="hidden" name="tenantId" value={tenant.id} />
                  <select
                    name="status"
                    defaultValue={subscription?.status ?? "TRIAL"}
                    className="h-9 rounded-full border border-sand-200 bg-white/80 px-3 text-xs font-semibold text-ink-700"
                  >
                    <option value="TRIAL">TRIAL</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAST_DUE">PAST_DUE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <Button type="submit" variant="outline" size="sm">
                    Update
                  </Button>
                </form>
                <form action={impersonateTenant}>
                  <input type="hidden" name="tenantId" value={tenant.id} />
                  <Button type="submit" disabled={isActive}>
                    {isActive ? "Impersonating" : "Impersonate"}
                  </Button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
