import { prisma } from "./prisma";
import type { PrismaClient, Prisma } from "@prisma/client";
import { getSeatUsage } from "./billing-access";
import { hashPassword } from "./password";

export async function createUserWithPassword(
  params: {
  email: string;
  name?: string | null;
  password: string;
  activeTenantId?: string | null;
  },
  client: PrismaClient | Prisma.TransactionClient = prisma
) {
  const passwordHash = await hashPassword(params.password);
  return client.user.create({
    data: {
      email: params.email,
      name: params.name ?? null,
      passwordHash,
      activeTenantId: params.activeTenantId ?? null
    }
  });
}

export async function createMembershipWithSeatCheck(
  params: {
    tenantId: string;
    userId: string;
    role: "OWNER" | "ADMIN" | "STAFF";
  },
  client: PrismaClient = prisma
) {
  const { seatLimit, memberCount } = await getSeatUsage(params.tenantId);
  if (seatLimit > 0 && memberCount >= seatLimit) {
    throw new Error("Seat limit reached");
  }

  return client.tenantMembership.create({
    data: {
      tenantId: params.tenantId,
      userId: params.userId,
      role: params.role
    }
  });
}
