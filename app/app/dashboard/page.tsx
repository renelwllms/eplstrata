import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.platformRole === "SUPER_ADMIN") {
    const impersonation = await prisma.adminImpersonation.findUnique({
      where: { adminUserId: session.user.id }
    });
    if (!impersonation) {
      redirect("/app/admin/tenants");
    }
  }

  await requireTenant();
  return <DashboardClient />;
}
