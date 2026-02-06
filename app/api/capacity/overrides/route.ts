import { jsonOk, handleError } from "../../../../lib/api";
import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireTenant();
    const payload = await request.json();
    const created = await prisma.capacityOverride.create({
      data: {
        tenantId: user.tenantId,
        userId: String(payload.userId),
        weeklyCapacityHours: Number(payload.weeklyCapacityHours),
        role: payload.role ? String(payload.role) : null,
        startDate: payload.startDate ? new Date(payload.startDate) : null,
        endDate: payload.endDate ? new Date(payload.endDate) : null
      }
    });
    return jsonOk({ data: created }, 201);
  } catch (error) {
    return handleError(error);
  }
}
