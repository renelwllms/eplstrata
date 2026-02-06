import { prisma } from "../../../../lib/prisma";
import { requireAuth, requireTenant } from "../../../../lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { AddUserForm } from "./user-form";

export default async function UsersSettingsPage() {
  const session = await requireAuth();
  const isSuperAdmin = session.platformRole === "SUPER_ADMIN";

  const tenantContext = isSuperAdmin ? null : await requireTenant();
  const tenantId = tenantContext?.tenantId ?? null;
  const tenantRole = tenantContext?.role ?? null;
  const canSelectTenant = isSuperAdmin || tenantRole === "ADMIN";

  if (!isSuperAdmin && tenantRole === "STAFF") {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Settings</p>
          <h1 className="font-display text-3xl">Users</h1>
        </div>
        <p className="text-sm text-ink-700">You do not have access to manage users.</p>
      </div>
    );
  }

  const [tenants, members] = await Promise.all([
    canSelectTenant
      ? prisma.tenant.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
      : [],
    prisma.tenantMembership.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: { user: true, tenant: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Settings</p>
        <h1 className="font-display text-3xl">Users</h1>
        <p className="text-sm text-ink-700">Invite staff to your tenant and manage access.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add staff member</CardTitle>
        </CardHeader>
        <CardContent>
          <AddUserForm tenants={tenants} canSelectTenant={canSelectTenant} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current team</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-ink-700">No members yet.</p>
          ) : (
            <div className="overflow-auto rounded-2xl border border-sand-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-sand-50 text-xs uppercase text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Tenant</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-t border-sand-100">
                      <td className="px-4 py-3 text-ink-900">
                        {member.user.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-700">{member.user.email}</td>
                      <td className="px-4 py-3 text-ink-700">{member.role}</td>
                      <td className="px-4 py-3 text-ink-700">{member.tenant?.name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
