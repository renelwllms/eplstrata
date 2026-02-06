"use server";

import { prisma } from "../../../../lib/prisma";
import { requireAuth, requireTenant } from "../../../../lib/session";
import { createMembershipWithSeatCheck, createUserWithPassword } from "../../../../lib/users";
import { sendEmail } from "../../../../lib/mailer";

export type AddUserState = { status: "idle" | "success" | "error"; message?: string };

export async function addUserAction(
  _prev: AddUserState,
  formData: FormData
): Promise<AddUserState> {
  try {
    const session = await requireAuth();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "STAFF").toUpperCase();
    const tempPassword = String(formData.get("tempPassword") ?? "");
    const tenantIdInput = String(formData.get("tenantId") ?? "");

    if (!email) {
      return { status: "error", message: "Email is required." };
    }

    if (!role || !["OWNER", "ADMIN", "STAFF"].includes(role)) {
      return { status: "error", message: "Role is invalid." };
    }

    let tenantId = "";

    if (session.platformRole === "SUPER_ADMIN") {
      if (!tenantIdInput) {
        return { status: "error", message: "Select a tenant." };
      }
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantIdInput } });
      if (!tenant) {
        return { status: "error", message: "Tenant not found." };
      }
      tenantId = tenant.id;
    } else {
      const tenant = await requireTenant();
      if (tenant.role !== "OWNER" && tenant.role !== "ADMIN") {
        return { status: "error", message: "Insufficient role." };
      }
      if (tenant.role === "ADMIN") {
        if (!tenantIdInput) {
          return { status: "error", message: "Select a tenant." };
        }
        const targetTenant = await prisma.tenant.findUnique({ where: { id: tenantIdInput } });
        if (!targetTenant) {
          return { status: "error", message: "Tenant not found." };
        }
        tenantId = targetTenant.id;
      } else {
        tenantId = tenant.tenantId;
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    const existingMembership = await prisma.tenantMembership.findUnique({
      where: { tenantId_userId: { tenantId, userId: existingUser?.id ?? "" } }
    });

    if (existingMembership) {
      return { status: "error", message: "User already exists in this tenant." };
    }

    let userId = existingUser?.id ?? "";
    let createdPassword: string | null = null;

    if (!existingUser) {
      if (!tempPassword || tempPassword.length < 10) {
        return { status: "error", message: "Temporary password must be at least 10 characters." };
      }

      const created = await createUserWithPassword({
        email,
        name: name || null,
        password: tempPassword,
        activeTenantId: tenantId
      });

      userId = created.id;
      createdPassword = tempPassword;

      await prisma.user.update({
        where: { id: userId },
        data: { mustResetPassword: true }
      });
    }

    await createMembershipWithSeatCheck({
      tenantId,
      userId,
      role: role as "OWNER" | "ADMIN" | "STAFF"
    });

    const appUrl =
      process.env.APP_BASE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://app.strata.edgepoint.co.nz";

    const messageLines = [
      `You have been added to a Strata tenant.`,
      `Login: ${email}`,
      createdPassword ? `Temporary password: ${createdPassword}` : null,
      `Sign in: ${appUrl}/signin`,
      createdPassword ? `You'll be prompted to set a new password on first login.` : null
    ].filter(Boolean) as string[];

    await sendEmail({
      to: email,
      subject: "Your Strata access",
      text: messageLines.join("\n")
    });

    return { status: "success", message: "User added successfully." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to add user."
    };
  }
}
