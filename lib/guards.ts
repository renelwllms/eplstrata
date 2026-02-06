import { requireTenant } from "./session";
import { assertFeatureEnabled, assertWriteAllowed, getTenantBillingContext, type FeatureCode } from "./billing-access";

export async function requireFeature(code: FeatureCode) {
  const user = await requireTenant();
  const context = await getTenantBillingContext(user.tenantId);
  if (user.platformRole !== "SUPER_ADMIN") {
    assertFeatureEnabled(context.featureFlags, code);
  }
  return { user, billing: context };
}

export async function requireWriteAccess(code: FeatureCode) {
  const { user, billing } = await requireFeature(code);
  if (user.platformRole !== "SUPER_ADMIN") {
    assertWriteAllowed(billing.subscription.status, code);
  }
  return { user, billing };
}
