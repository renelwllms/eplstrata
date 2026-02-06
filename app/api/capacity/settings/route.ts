import { jsonOk, handleError } from "../../../../lib/api";
import { prisma } from "../../../../lib/prisma";
import { requireTenant } from "../../../../lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireTenant();
    const settings = await prisma.capacitySettings.findUnique({
      where: { tenantId: user.tenantId }
    });
    return jsonOk({ data: settings });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireTenant();
    const payload = await request.json();
    const settings = await prisma.capacitySettings.upsert({
      where: { tenantId: user.tenantId },
      create: {
        tenantId: user.tenantId,
        workingHoursPerDay: Number(payload.workingHoursPerDay ?? 8),
        workingDays: String(payload.workingDays ?? "MON,TUE,WED,THU,FRI"),
        allowOvertime: Boolean(payload.allowOvertime ?? false)
      },
      update: {
        workingHoursPerDay: Number(payload.workingHoursPerDay ?? 8),
        workingDays: String(payload.workingDays ?? "MON,TUE,WED,THU,FRI"),
        allowOvertime: Boolean(payload.allowOvertime ?? false)
      }
    });

    return jsonOk({ data: settings });
  } catch (error) {
    return handleError(error);
  }
}
