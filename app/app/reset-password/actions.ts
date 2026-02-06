"use server";

import { prisma } from "../../../lib/prisma";
import { requireAuth } from "../../../lib/session";
import { hashPassword } from "../../../lib/password";
import { sendEmail } from "../../../lib/mailer";

type ResetState = { status: "idle" | "error" | "success"; message: string };

export async function resetPasswordAction(
  _prevState: ResetState,
  formData: FormData
): Promise<ResetState> {
  try {
    const user = await requireAuth();
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (!password || password.length < 10) {
      return { status: "error", message: "Password must be at least 10 characters." };
    }

    if (password !== confirm) {
      return { status: "error", message: "Passwords do not match." };
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, mustResetPassword: false }
    });

    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Your Strata password was updated",
        text: "Your Strata password has been reset successfully. If you did not make this change, please contact support immediately."
      });
    }

    return { status: "success", message: "" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to reset password."
    };
  }
}
