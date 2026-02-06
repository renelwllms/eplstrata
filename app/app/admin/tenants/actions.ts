"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../../lib/prisma";
import { requireSuperAdmin } from "../../../../lib/session";
import { logAudit } from "../../../../lib/audit";
import { createMembershipWithSeatCheck, createUserWithPassword } from "../../../../lib/users";
import { sendEmail } from "../../../../lib/mailer";
import type { CreateTenantState } from "./types";

export async function impersonateTenant(formData: FormData) {
  const user = await requireSuperAdmin();
  const tenantId = String(formData.get("tenantId") ?? "");

  if (!tenantId) {
    throw new Error("tenantId required");
  }

  await prisma.adminImpersonation.upsert({
    where: { adminUserId: user.id },
    update: { tenantId, userId: null },
    create: { adminUserId: user.id, tenantId }
  });

  await logAudit({
    tenantId,
    actorUserId: user.id,
    action: "ADMIN_IMPERSONATE",
    entityType: "Tenant",
    entityId: tenantId
  });

  revalidatePath("/app");
  redirect("/app/dashboard");
}

export async function clearImpersonation() {
  const user = await requireSuperAdmin();

  await prisma.adminImpersonation.deleteMany({
    where: { adminUserId: user.id }
  });

  revalidatePath("/app");
  redirect("/app/admin/tenants");
}

export async function updateTenantStatus(formData: FormData) {
  const user = await requireSuperAdmin();
  const tenantId = String(formData.get("tenantId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!tenantId || !status) {
    throw new Error("Missing tenant or status.");
  }

  const latest = await prisma.subscription.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" }
  });

  if (!latest) {
    throw new Error("Subscription missing.");
  }

  await prisma.subscription.update({
    where: { id: latest.id },
    data: { status: status as any }
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      actorUserId: user.id,
      action: "ADMIN_UPDATE_SUBSCRIPTION",
      entityType: "Subscription",
      entityId: latest.id,
      metadata: { status }
    }
  });

  revalidatePath("/app/admin/tenants");
}

export async function createAdminTenant() {
  const user = await requireSuperAdmin();

  let adminTenant = await prisma.tenant.findFirst({
    where: { name: "EdgePoint Admin" }
  });

  if (!adminTenant) {
    const plan =
      (await prisma.plan.findUnique({ where: { code: "ENTERPRISE" } })) ??
      (await prisma.plan.findUnique({ where: { code: "PRO" } })) ??
      (await prisma.plan.findUnique({ where: { code: "STARTER" } })) ??
      (await prisma.plan.findFirst());

    if (!plan) {
      throw new Error("No plan available.");
    }

    const periodStart = new Date();
    const periodEnd = plan.billingPeriod === "YEAR" ? addDays(periodStart, 365) : addDays(periodStart, 30);

    adminTenant = await prisma.tenant.create({
      data: {
        name: "EdgePoint Admin",
        settings: {
          create: {
            businessName: "EdgePoint Admin",
            currency: "NZD",
            timezone: "Pacific/Auckland",
            gstRate: 0.15,
            taxMode: "EXCLUSIVE",
            taxDiscountMode: "TAX_BEFORE_DISCOUNT",
            timeRoundingMinutes: 15,
            defaultBillable: true,
            timesheetView: "WEEKLY"
          }
        },
        numberSequences: {
          create: [
            { entityType: "JOB", prefix: "ADM-J-", nextNumber: 1001 },
            { entityType: "QUOTE", prefix: "ADM-Q-", nextNumber: 2001 },
            { entityType: "INVOICE", prefix: "ADM-INV-", nextNumber: 3001 }
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
        },
        subscriptions: {
          create: {
            planId: plan.id,
            status: "ACTIVE",
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd
          }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: adminTenant.id,
        actorUserId: user.id,
        action: "ADMIN_CREATE_TENANT",
        entityType: "Tenant",
        entityId: adminTenant.id,
        metadata: { type: "EDGEPOINT_ADMIN" }
      }
    });
  }

  await prisma.adminImpersonation.upsert({
    where: { adminUserId: user.id },
    update: { tenantId: adminTenant.id, userId: null },
    create: { adminUserId: user.id, tenantId: adminTenant.id }
  });

  revalidatePath("/app");
  redirect("/app/dashboard");
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function createTenantWithOwner(
  _prevState: CreateTenantState,
  formData: FormData
): Promise<CreateTenantState> {
  try {
    const user = await requireSuperAdmin();
    const tenantName = String(formData.get("tenantName") ?? "").trim();
    const ownerName = String(formData.get("ownerName") ?? "").trim();
    const ownerEmail = String(formData.get("ownerEmail") ?? "").trim().toLowerCase();
    const ownerPassword = String(formData.get("ownerPassword") ?? "");
    const planId = String(formData.get("planId") ?? "");
    const status = String(formData.get("status") ?? "TRIAL");

    if (!tenantName || !ownerEmail || !ownerPassword || !planId) {
      return { status: "error", message: "Missing required fields." };
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return { status: "error", message: "Plan not found." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existingUser) {
      return { status: "error", message: "User already exists." };
    }

    const periodStart = new Date();
    const periodEnd = plan.billingPeriod === "YEAR" ? addDays(periodStart, 365) : addDays(periodStart, 30);

    const created = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          settings: {
            create: {
              businessName: tenantName,
              currency: "NZD",
              timezone: "Pacific/Auckland",
              gstRate: 0.15,
              taxMode: "EXCLUSIVE",
              taxDiscountMode: "TAX_BEFORE_DISCOUNT",
              timeRoundingMinutes: 15,
              defaultBillable: true,
              timesheetView: "WEEKLY"
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

      const owner = await createUserWithPassword(
        {
          email: ownerEmail,
          name: ownerName || null,
          password: ownerPassword,
          activeTenantId: tenant.id
        },
        tx
      );

      await tx.tenantMembership.create({
        data: {
          tenantId: tenant.id,
          userId: owner.id,
          role: "OWNER"
        }
      });

      await tx.user.update({
        where: { id: owner.id },
        data: { mustResetPassword: true }
      });

      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          status: status as any,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          actorUserId: user.id,
          action: "ADMIN_CREATE_TENANT",
          entityType: "Tenant",
          entityId: tenant.id,
          metadata: { ownerEmail }
        }
      });

      return tenant;
    });

    const appUrl =
      process.env.APP_BASE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://app.strata.edgepoint.co.nz";

    const emailResult = await sendEmail({
      to: ownerEmail,
      subject: `Your ${created.name} Strata account`,
      text: [
        `Welcome to EdgePoint Strata.`,
        `Tenant: ${created.name}`,
        `Login: ${ownerEmail}`,
        `Temporary password: ${ownerPassword}`,
        `Sign in: ${appUrl}/signin`,
        `You'll be prompted to set a new password on first login.`
      ].join("\n")
    });

    revalidatePath("/app/admin/tenants");
    return {
      status: "success",
      tenantId: created.id,
      tenantName: created.name,
      ownerEmail,
      ownerPassword,
      emailSent: emailResult.ok,
      emailError: emailResult.ok ? null : emailResult.error
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create tenant."
    };
  }
}

export async function createTenantUsers(
  _prevState: { status: "idle" | "error" | "success"; message?: string },
  formData: FormData
): Promise<{ status: "idle" | "error" | "success"; message?: string }> {
  try {
    await requireSuperAdmin();
    const tenantId = String(formData.get("tenantId") ?? "");
    const usersJson = String(formData.get("users") ?? "[]");

    if (!tenantId) {
      return { status: "error", message: "Tenant id missing." };
    }

    const users = JSON.parse(usersJson) as Array<{
      name: string;
      email: string;
      role: "OWNER" | "ADMIN" | "STAFF";
      password: string;
    }>;

    if (!Array.isArray(users) || users.length === 0) {
      return { status: "error", message: "Add at least one user or skip this step." };
    }

    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        const email = user.email.trim().toLowerCase();
        if (!email || !user.password) {
          throw new Error("Each user requires an email and temporary password.");
        }

        const existing = await tx.user.findUnique({ where: { email } });
        if (existing) {
          throw new Error(`User already exists: ${email}`);
        }

        const created = await createUserWithPassword(
          {
            email,
            name: user.name?.trim() || null,
            password: user.password,
            activeTenantId: tenantId
          },
          tx
        );

        await createMembershipWithSeatCheck(
          { tenantId, userId: created.id, role: user.role },
          tx as any
        );

        await tx.user.update({
          where: { id: created.id },
          data: { mustResetPassword: true }
        });
      }
    });

    const appUrl =
      process.env.APP_BASE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://app.strata.edgepoint.co.nz";

    await Promise.allSettled(
      users.map((user) =>
        sendEmail({
          to: user.email,
          subject: "Your Strata account",
          text: [
            `Welcome to EdgePoint Strata.`,
            `Login: ${user.email}`,
            `Temporary password: ${user.password}`,
            `Sign in: ${appUrl}/signin`,
            `You'll be prompted to set a new password on first login.`
          ].join("\n")
        })
      )
    );

    revalidatePath("/app/admin/tenants");
    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create users."
    };
  }
}
