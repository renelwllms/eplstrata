import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    if (session.user.platformRole === "SUPER_ADMIN" && !session.user.activeTenantId) {
      redirect("/app/admin/tenants");
    }
    redirect("/app/dashboard");
  }

  redirect("/signin?callbackUrl=%2Fapp%2Fdashboard");
}
