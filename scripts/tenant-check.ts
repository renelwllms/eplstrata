import { PrismaClient } from "@prisma/client";
import { tenantScopedPrisma } from "../lib/tenant";
import { createUserWithPassword } from "../lib/users";

const prisma = new PrismaClient();

async function main() {
  const tenantA = await prisma.tenant.create({ data: { name: "Tenant A" } });
  const tenantB = await prisma.tenant.create({ data: { name: "Tenant B" } });

  const userA = await createUserWithPassword(
    {
      email: "tenant-a@example.com",
      password: "Password123!",
      activeTenantId: tenantA.id
    },
    prisma
  );

  const userB = await createUserWithPassword(
    {
      email: "tenant-b@example.com",
      password: "Password123!",
      activeTenantId: tenantB.id
    },
    prisma
  );

  await prisma.tenantMembership.createMany({
    data: [
      { tenantId: tenantA.id, userId: userA.id, role: "OWNER" },
      { tenantId: tenantB.id, userId: userB.id, role: "OWNER" }
    ]
  });

  const clientA = await prisma.client.create({
    data: {
      tenantId: tenantA.id,
      name: "Client A"
    }
  });

  const clientB = await prisma.client.create({
    data: {
      tenantId: tenantB.id,
      name: "Client B"
    }
  });

  const jobA = await prisma.job.create({
    data: {
      tenantId: tenantA.id,
      clientId: clientA.id,
      jobNumber: "J-TA-1",
      name: "Job A",
      status: "ACTIVE"
    }
  });

  const jobB = await prisma.job.create({
    data: {
      tenantId: tenantB.id,
      clientId: clientB.id,
      jobNumber: "J-TB-1",
      name: "Job B",
      status: "ACTIVE"
    }
  });

  const scopedA = tenantScopedPrisma(tenantA.id, prisma);
  const scopedJobs = await scopedA.job.findMany();

  console.log("Tenant A scoped jobs count:", scopedJobs.length);

  try {
    await scopedA.job.findUnique({ where: { id: jobB.id } });
    console.log("Unexpected: accessed tenant B job from tenant A scope");
  } catch (error) {
    console.log("Blocked cross-tenant access as expected");
  }

  try {
    await scopedA.job.create({
      data: {
        tenantId: tenantB.id,
        clientId: clientA.id,
        jobNumber: "J-TA-2",
        name: "Bad Job",
        status: "ACTIVE"
      }
    });
  } catch (error) {
    console.log("Blocked tenantId mismatch on create as expected");
  }

  console.log("Created jobs:", jobA.jobNumber, jobB.jobNumber);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
