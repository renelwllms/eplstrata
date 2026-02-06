import { prisma } from "./prisma";

export async function assertLeadAccess(params: {
  tenantId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "STAFF";
  leadId: string;
}) {
  if (params.role === "OWNER" || params.role === "ADMIN") {
    return;
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.leadId },
    select: { ownerUserId: true, tenantId: true }
  });

  if (!lead || lead.tenantId !== params.tenantId) {
    throw new Error("Lead not found");
  }

  if (lead.ownerUserId !== params.userId) {
    throw new Error("Lead access denied");
  }
}
