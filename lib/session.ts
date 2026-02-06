import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { hasRole } from "./rbac";
import type { Role } from "@prisma/client";
import { assertLoginAllowed, getTenantSubscriptionStatus } from "./billing-access";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    activeTenantId: session.user.activeTenantId ?? null,
    role: session.user.role ?? null,
    platformRole: session.user.platformRole ?? null,
    mustResetPassword: session.user.mustResetPassword ?? false
  };
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireTenant(options?: { redirectToAdminIfSuper?: boolean }) {
  const shouldRedirect = options?.redirectToAdminIfSuper ?? true;
  const user = await requireAuth();
  if (user.platformRole === "SUPER_ADMIN") {
    const impersonation = await prisma.adminImpersonation.findUnique({
      where: { adminUserId: user.id }
    });

    if (!impersonation) {
      if (shouldRedirect) {
        redirect("/app/admin/tenants");
      }
      throw new Error("Impersonation required");
    }

    const status = await getTenantSubscriptionStatus(impersonation.tenantId);
    assertLoginAllowed(status);

    return {
      ...user,
      role: "OWNER" as Role,
      tenantId: impersonation.tenantId
    };
  }

  if (!user.activeTenantId) {
    throw new Error("Active tenant not selected");
  }

  const membership = await prisma.tenantMembership.findUnique({
    where: {
      tenantId_userId: {
        tenantId: user.activeTenantId,
        userId: user.id
      }
    }
  });

  if (!membership) {
    throw new Error("Tenant access denied");
  }

  const status = await getTenantSubscriptionStatus(user.activeTenantId);
  assertLoginAllowed(status);

  return {
    ...user,
    role: membership.role,
    tenantId: user.activeTenantId
  };
}

export async function requireRole(minRole: Role) {
  const user = await requireTenant();
  if (!user.role || !hasRole(minRole, user.role)) {
    throw new Error("Insufficient role");
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();
  if (user.platformRole !== "SUPER_ADMIN") {
    throw new Error("Insufficient role");
  }
  return user;
}
