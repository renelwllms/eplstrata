import { jsonOk, handleError } from "../../../lib/api";
import { getCapacityPayload, getDefaultRange } from "../../../lib/capacity";
import { requireTenant } from "../../../lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireTenant();
    const url = new URL(request.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");
    const range = start && end ? { start, end } : getDefaultRange();
    const payload = await getCapacityPayload(user.tenantId, range);
    return jsonOk({ data: payload });
  } catch (error) {
    return handleError(error);
  }
}
