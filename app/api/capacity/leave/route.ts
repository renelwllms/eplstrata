import { jsonOk, handleError } from "../../../../lib/api";
import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireTenant();
    const payload = await request.json();
    const created = await prisma.capacityLeave.create({
      data: {
        tenantId: user.tenantId,
        userId: String(payload.userId),
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        hoursPerDay: payload.hoursPerDay ? Number(payload.hoursPerDay) : null
      }
    });
    return jsonOk({ data: created }, 201);
  } catch (error) {
    return handleError(error);
  }
}
