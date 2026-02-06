import { prisma } from "../../../../lib/prisma";
import { timeEntryService } from "../../../../lib/services/time-entries";
import { requireFeature } from "../../../../lib/guards";
import { jsonOk, handleError } from "../../../../lib/api";
import { weekQuerySchema } from "../../../../lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { user } = await requireFeature("TIME");
    const url = new URL(request.url);
    const query = weekQuerySchema.parse({
      date: url.searchParams.get("date")
    });

    const service = timeEntryService(user.tenantId, prisma);
    const summary = await service.weekSummary(query.date, user.id, user.role);

    return jsonOk({ data: summary });
  } catch (error) {
    return handleError(error);
  }
}
