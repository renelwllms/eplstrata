"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "../../lib/session";
import { prisma } from "../../lib/prisma";
import { logAudit } from "../../lib/audit";

export async function switchTenantAction(formData: FormData) {
  const user = await requireAuth();
  const tenantId = String(formData.get("tenantId") ?? "");

  if (!tenantId) {
    throw new Error("tenantId required");
  }

  const membership = await prisma.tenantMembership.findUnique({
    where: { tenantId_userId: { tenantId, userId: user.id } }
  });

  if (!membership) {
    throw new Error("Access denied");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { activeTenantId: tenantId }
  });

  await logAudit({
    tenantId,
    actorUserId: user.id,
    action: "TENANT_SWITCH",
    entityType: "Tenant",
    entityId: tenantId,
    metadata: { fromTenantId: user.activeTenantId ?? null }
  });

  revalidatePath("/app");
}
