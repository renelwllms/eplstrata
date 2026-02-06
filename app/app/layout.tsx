import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { switchTenantAction } from "./actions";
import { TopNav } from "../../components/app/top-nav";
import { getTenantBillingContext } from "../../lib/billing-access";
import { ResetPasswordForm } from "./reset-password/reset-password-form";
import { MobileSplash } from "./splash";
import { TimerOverlay } from "../../components/app/timer-overlay";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { adminImpersonation: { include: { tenant: true } } }
  });

  const isSuperAdmin = dbUser?.platformRole === "SUPER_ADMIN";
  const impersonation = isSuperAdmin ? dbUser?.adminImpersonation ?? null : null;

  const memberships = await prisma.tenantMembership.findMany({
    where: { userId: session.user.id },
    include: { tenant: true }
  });

  const tenants = memberships.map((membership) => ({
    id: membership.tenantId,
    name: membership.tenant.name
  }));

  const activeTenantId = impersonation?.tenantId ?? session.user.activeTenantId;

  const billing = activeTenantId
    ? await getTenantBillingContext(activeTenantId)
    : null;

  if (session.user.mustResetPassword) {
    return (
      <div className="min-h-screen app-shell-bg">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
          <ResetPasswordForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-shell-bg">
      <MobileSplash />
      <TopNav
        tenants={isSuperAdmin ? [] : tenants}
        activeTenantId={activeTenantId}
        onSwitch={switchTenantAction}
        user={{ name: session.user.name, email: session.user.email }}
        billingStatus={billing?.subscription.status}
        readOnly={isSuperAdmin ? false : billing?.readOnly}
        isSuperAdmin={isSuperAdmin}
        impersonationTenantName={impersonation?.tenant?.name ?? null}
      />
      <main className="mx-auto max-w-6xl px-6 py-10 print:max-w-none print:px-0 print:py-0">
        {children}
      </main>
      <TimerOverlay />
      <footer className="border-t border-white/40 bg-white/60 print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-ink-500">
          <span>Developed by EdgePoint</span>
          <span>EdgePoint Strata</span>
        </div>
      </footer>
    </div>
  );
}
