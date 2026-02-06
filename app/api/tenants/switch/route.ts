import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAuth } from "../../../../lib/session";
import { logAudit } from "../../../../lib/audit";

export async function POST(request: Request) {
  const user = await requireAuth();
  const body = (await request.json()) as { tenantId?: string };
  const tenantId = body?.tenantId;

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 });
  }

  const membership = await prisma.tenantMembership.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId: user.id
      }
    }
  });

  if (!membership) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
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

  return NextResponse.json({ ok: true, activeTenantId: tenantId });
}
