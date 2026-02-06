import { prisma } from "./prisma";
import type { SubscriptionStatus } from "@prisma/client";

export type FeatureCode =
  | "CLIENTS"
  | "JOBS"
  | "TASKS"
  | "TIME"
  | "COSTS"
  | "QUOTES"
  | "INVOICES"
  | "PAYMENTS"
  | "REPORTING"
  | "CUSTOM_FIELDS"
  | "NOTIFICATIONS"
  | "UPLOADS"
  | "LEADS"
  | "DOCUMENTS"
  | "CUSTOMISATION"
  | "QUOTES_ENHANCED"
  | "INVOICES_ENHANCED";

export async function getTenantBillingContext(tenantId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId },
    include: { plan: { include: { features: true } } },
    orderBy: { createdAt: "desc" }
  });

  if (!subscription) {
    throw new Error("Subscription missing");
  }

  const featureFlags = new Set(subscription.plan.features.map((feature) => feature.code));
  const readOnly = isReadOnlyStatus(subscription.status);

  return {
    subscription,
    plan: subscription.plan,
    readOnly,
    featureFlags
  };
}

export function assertFeatureEnabled(featureFlags: Set<string>, code: FeatureCode) {
  if (!featureFlags.has(code)) {
    throw new Error("Feature not available on current plan");
  }
}

export function isReadOnlyStatus(status: SubscriptionStatus) {
  return status === "TRIAL" || status === "SUSPENDED";
}

export function assertLoginAllowed(status: SubscriptionStatus) {
  if (status === "CANCELLED") {
    throw new Error("Account cancelled");
  }
}

export function assertWriteAllowed(status: SubscriptionStatus, code: FeatureCode) {
  if (status === "TRIAL" || status === "SUSPENDED" || status === "CANCELLED") {
    throw new Error("Account is read-only due to billing status");
  }

  if (status === "PAST_DUE") {
    const blocked = code === "INVOICES" || code === "INVOICES_ENHANCED" || code === "TIME";
    if (blocked) {
      throw new Error("Account is past due. Invoices and time entries are disabled.");
    }
  }
}

export async function getSeatUsage(tenantId: string) {
  const [seatLimit, memberCount] = await Promise.all([
    prisma.subscription.findFirst({
      where: { tenantId },
      include: { plan: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.tenantMembership.count({ where: { tenantId } })
  ]);

  return {
    seatLimit: seatLimit?.plan.seatLimit ?? 0,
    memberCount
  };
}

export async function getTenantSubscriptionStatus(tenantId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    select: { status: true }
  });

  if (!subscription) {
    throw new Error("Subscription missing");
  }

  return subscription.status;
}
