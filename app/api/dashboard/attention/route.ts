import { NextResponse } from "next/server";
import { requireTenant } from "../../../../lib/session";
import { getAttentionItemsForTenant } from "../../../../lib/dashboard";

export async function GET(request: Request) {
  const user = await requireTenant({ redirectToAdminIfSuper: false });
  const url = new URL(request.url);
  const range = url.searchParams.get("range") as "7d" | "30d" | "month" | "custom" | null;
  const team = url.searchParams.get("team") as "all" | "my" | null;
  const owner = url.searchParams.get("owner") as "me" | "all" | null;
  return NextResponse.json(
    await getAttentionItemsForTenant(user.tenantId, {
      range: range ?? undefined,
      team: team ?? undefined,
      owner: owner ?? undefined
    })
  );
}
