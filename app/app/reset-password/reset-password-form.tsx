"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { resetPasswordAction } from "./actions";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

type ResetState = { status: "idle" | "error" | "success"; message: string };

export function ResetPasswordForm() {
  const [state, formAction] = useFormState<ResetState, FormData>(resetPasswordAction, {
    status: "idle",
    message: ""
  });

  useEffect(() => {
    if (state.status === "success") {
      window.location.href = "/app/dashboard";
    }
  }, [state.status]);

  return (
    <Card className="mx-auto w-full max-w-md space-y-4 px-6 py-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
          Password reset
        </p>
        <h1 className="text-2xl font-semibold text-ink-900">Set a new password</h1>
        <p className="text-sm text-ink-500">
          This account requires a new password before you can continue.
        </p>
      </div>
      <form action={formAction} className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
            New password
          </label>
          <Input name="password" type="password" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
            Confirm password
          </label>
          <Input name="confirm" type="password" required />
        </div>
        {state.status === "error" && (
          <p className="text-sm text-rose-600">{state.message}</p>
        )}
        <SubmitButton />
      </form>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Saving..." : "Save password"}
    </Button>
  );
}
