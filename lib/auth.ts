import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./password";
import { logAudit } from "./audit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin"
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { memberships: true }
        });

        if (!user) {
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        const membership = user.memberships[0];

        if (!valid) {
          if (membership) {
            await logAudit({
              tenantId: membership.tenantId,
              actorUserId: user.id,
              action: "AUTH_LOGIN_FAILURE",
              entityType: "User",
              entityId: user.id,
              metadata: { email }
            });
          }
          return null;
        }

        if (user.platformRole !== "SUPER_ADMIN") {
          const tenantIds = user.memberships.map((item) => item.tenantId);
          if (tenantIds.length === 0) {
            return null;
          }

          const subscriptions = await prisma.subscription.findMany({
            where: { tenantId: { in: tenantIds } },
            orderBy: { createdAt: "desc" },
            distinct: ["tenantId"],
            select: { tenantId: true, status: true }
          });

          const statusByTenant = new Map(subscriptions.map((item) => [item.tenantId, item.status]));
          const isTenantActive = (tenantId?: string | null) =>
            !!tenantId && (statusByTenant.get(tenantId) ?? "CANCELLED") !== "CANCELLED";

          let nextTenantId = user.activeTenantId;

          if (!isTenantActive(nextTenantId)) {
            nextTenantId = tenantIds.find((tenantId) => isTenantActive(tenantId)) ?? null;
          }

          if (!nextTenantId) {
            return null;
          }

          if (user.activeTenantId !== nextTenantId) {
            await prisma.user.update({
              where: { id: user.id },
              data: { activeTenantId: nextTenantId }
            });
          }
        }

        if (membership) {
          await logAudit({
            tenantId: membership.tenantId,
            actorUserId: user.id,
            action: "AUTH_LOGIN_SUCCESS",
            entityType: "User",
            entityId: user.id
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }

      if (!token.userId) {
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: token.userId },
        include: { memberships: true }
      });

      if (!dbUser) {
        return token;
      }

      if (dbUser.platformRole === "SUPER_ADMIN") {
        const impersonation = await prisma.adminImpersonation.findUnique({
          where: { adminUserId: dbUser.id }
        });

        token.activeTenantId = impersonation?.tenantId ?? null;
        token.role = impersonation ? "OWNER" : null;
        token.platformRole = dbUser.platformRole;
        token.mustResetPassword = dbUser.mustResetPassword ?? false;
        return token;
      }

      const activeTenantId = dbUser.activeTenantId ?? dbUser.memberships[0]?.tenantId ?? null;
      const membership = dbUser.memberships.find(
        (item) => item.tenantId === activeTenantId
      );

      token.activeTenantId = activeTenantId;
      token.role = membership?.role ?? null;
      token.platformRole = dbUser.platformRole ?? null;
      token.mustResetPassword = dbUser.mustResetPassword ?? false;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.activeTenantId = token.activeTenantId as string | null;
        session.user.role = token.role as string | null;
        session.user.platformRole = token.platformRole as string | null;
        session.user.mustResetPassword = token.mustResetPassword as boolean | null;
      }
      return session;
    }
  }
};
