 import { NextResponse } from "next/server";
 import { requireTenant } from "../../../../lib/session";
import { getRevenuePayloadForTenant } from "../../../../lib/dashboard";

export async function GET(request: Request) {
  const user = await requireTenant({ redirectToAdminIfSuper: false });
  const url = new URL(request.url);
  const range = url.searchParams.get("range") === "30d" ? "30d" : "7d";
  return NextResponse.json(await getRevenuePayloadForTenant(user.tenantId, range));
}
