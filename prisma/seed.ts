import { Prisma, PrismaClient } from "@prisma/client";
import { createMembershipWithSeatCheck } from "../lib/users";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seeding disabled in production.");
  }
  const plan = await prisma.plan.upsert({
    where: { code: "STARTER" },
    update: {
      name: "Starter",
      priceCents: 4900,
      billingPeriod: "MONTH",
      seatLimit: 5
    },
    create: {
      code: "STARTER",
      name: "Starter",
      priceCents: 4900,
      billingPeriod: "MONTH",
      seatLimit: 5,
      features: {
        create: [
          { code: "CLIENTS", enabled: true },
          { code: "JOBS", enabled: true },
          { code: "TASKS", enabled: true },
          { code: "TIME", enabled: true },
          { code: "COSTS", enabled: true },
          { code: "QUOTES", enabled: true },
          { code: "INVOICES", enabled: true },
          { code: "PAYMENTS", enabled: true },
          { code: "CUSTOM_FIELDS", enabled: true },
          { code: "NOTIFICATIONS", enabled: true },
          { code: "UPLOADS", enabled: true },
          { code: "LEADS", enabled: true },
          { code: "DOCUMENTS", enabled: true },
          { code: "CUSTOMISATION", enabled: true },
          { code: "QUOTES_ENHANCED", enabled: true },
          { code: "INVOICES_ENHANCED", enabled: true }
        ]
      }
    }
  });

  const tenant = await prisma.tenant.create({
    data: {
      name: "Acme Services Ltd",
      settings: {
        create: {
          businessName: "Acme Services Ltd",
          businessEmail: "hello@acme.test",
          businessPhone: "+64 9 555 0100",
          businessWebsite: "https://acme.test",
          businessAddress: "123 Queen Street\nAuckland",
          currency: "NZD",
          timezone: "Pacific/Auckland",
          gstRate: new Prisma.Decimal("0.15"),
          taxMode: "EXCLUSIVE",
          taxDiscountMode: "TAX_BEFORE_DISCOUNT",
          timeRoundingMinutes: 15,
          defaultBillable: true,
          timesheetView: "WEEKLY",
          defaultTermsQuote: "Payment due within 14 days.",
          defaultTermsInvoice: "Payment due within 14 days.",
          leadCaptureToken: "demo-lead-capture"
        }
      },
      numberSequences: {
        create: [
          { entityType: "JOB", prefix: "J-", nextNumber: 1001 },
          { entityType: "QUOTE", prefix: "Q-", nextNumber: 2001 },
          { entityType: "INVOICE", prefix: "INV-", nextNumber: 3001 }
        ]
      },
      leadStages: {
        create: [
          { name: "New", sortOrder: 1 },
          { name: "Qualified", sortOrder: 2 },
          { name: "Proposal", sortOrder: 3 },
          { name: "Won", sortOrder: 4, isClosed: true, isWon: true },
          { name: "Lost", sortOrder: 5, isClosed: true, isWon: false }
        ]
      },
      jobStages: {
        create: [
          { name: "Quote", sortOrder: 1 },
          { name: "Active", sortOrder: 2 },
          { name: "On Hold", sortOrder: 3, isClosed: false },
          { name: "Completed", sortOrder: 4, isClosed: true },
          { name: "Cancelled", sortOrder: 5, isClosed: true }
        ]
      }
    }
  });

  const passwordHash = await hashPassword("Strata123!");
  const superAdminPasswordHash = await hashPassword("Strata123!");
  const user = await prisma.user.upsert({
    where: { email: "owner@demo.local" },
    update: {
      name: "Owner User",
      passwordHash,
      activeTenantId: tenant.id
    },
    create: {
      email: "owner@demo.local",
      name: "Owner User",
      passwordHash,
      activeTenantId: tenant.id
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@edgepoint.local" },
    update: {
      name: "EdgePoint Admin",
      passwordHash: superAdminPasswordHash,
      platformRole: "SUPER_ADMIN"
    },
    create: {
      email: "admin@edgepoint.local",
      name: "EdgePoint Admin",
      passwordHash: superAdminPasswordHash,
      platformRole: "SUPER_ADMIN"
    }
  });

  await createMembershipWithSeatCheck({
    tenantId: tenant.id,
    userId: user.id,
    role: "OWNER"
  });

  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      planId: plan.id,
      status: "TRIAL",
      currentPeriodStart: new Date("2026-02-01T00:00:00.000Z"),
      currentPeriodEnd: new Date("2026-03-01T00:00:00.000Z")
    }
  });

  const client = await prisma.client.create({
    data: {
      tenantId: tenant.id,
      name: "Harbor View Cafe",
      billingEmail: "accounts@harborview.co.nz",
      phone: "+64 9 555 0100",
      defaultBillableRate: new Prisma.Decimal("125.00"),
      city: "Auckland",
      country: "New Zealand"
    }
  });

  const task = await prisma.taskCatalog.create({
    data: {
      tenantId: tenant.id,
      name: "Discovery & Planning",
      defaultBillableRate: new Prisma.Decimal("150.00")
    }
  });

  const job = await prisma.job.create({
    data: {
      tenantId: tenant.id,
      clientId: client.id,
      jobNumber: "J-1001",
      name: "Website Refresh",
      status: "ACTIVE",
      billableRateOverride: new Prisma.Decimal("140.00"),
      startDate: new Date("2026-02-01"),
      dueDate: new Date("2026-02-28"),
      budgetMinutes: 2400
    }
  });

  await prisma.jobMilestone.create({
    data: {
      tenantId: tenant.id,
      jobId: job.id,
      name: "Design approval",
      dueDate: new Date("2026-02-10")
    }
  });

  const phase = await prisma.phase.create({
    data: {
      tenantId: tenant.id,
      jobId: job.id,
      name: "Phase 1: Strategy",
      budgetMinutes: 600,
      customField: "Discovery"
    }
  });

  await prisma.timeEntry.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      jobId: job.id,
      taskCatalogId: task.id,
      phaseId: phase.id,
      date: new Date("2026-02-02"),
      durationMinutes: 120,
      billable: true,
      isLocked: false,
      notes: "Kickoff workshop"
    }
  });

  await prisma.jobAssignment.create({
    data: {
      tenantId: tenant.id,
      jobId: job.id,
      userId: user.id
    }
  });

  await prisma.quoteTemplate.create({
    data: {
      tenantId: tenant.id,
      name: "Standard Quote",
      layout: "STANDARD",
      defaults: {
        intro: "Thanks for the opportunity to quote this work."
      }
    }
  });

  await prisma.invoiceTemplate.create({
    data: {
      tenantId: tenant.id,
      name: "Standard Invoice",
      layout: "STANDARD",
      defaults: {
        footer: "Payment due within 14 days."
      }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
