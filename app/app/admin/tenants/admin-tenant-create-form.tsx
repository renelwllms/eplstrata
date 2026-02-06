"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { createTenantWithOwner } from "./actions";
import type { CreateTenantState } from "./types";

type Plan = {
  id: string;
  name: string;
  billingPeriod: "MONTH" | "YEAR";
};

type CreateState = CreateTenantState;

function generateTempPassword() {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 14; i += 1) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  return password;
}

export function AdminTenantCreateForm({ plans }: { plans: Plan[] }) {
  const [state, formAction] = useFormState<CreateState, FormData>(createTenantWithOwner, {
    status: "idle",
    message: ""
  });
  const [tempPassword, setTempPassword] = React.useState(generateTempPassword());
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (state.status === "success") {
      setCopied(false);
    }
  }, [state.status]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        state.status === "success" ? state.ownerPassword : tempPassword
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (state.status === "success") {
    return (
      <Card className="space-y-4 px-5 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
            Tenant created
          </p>
          <p className="text-sm text-ink-500">
            Save these details and share the temporary password with the owner.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-ink-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
              Tenant
            </p>
            <p className="text-base font-semibold text-ink-900">{state.tenantName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
              Owner email
            </p>
            <p className="text-base font-semibold text-ink-900">{state.ownerEmail}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
              Temporary password
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-sand-100 px-3 py-2 text-sm font-semibold text-ink-900">
                {state.ownerPassword}
              </code>
              <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
              Email delivery
            </p>
            <p className={`text-sm ${state.emailSent ? "text-emerald-700" : "text-amber-700"}`}>
              {state.emailSent ? "Sent successfully." : "SMTP not configured. Send manually."}
            </p>
            {!state.emailSent && state.emailError && (
              <p className="text-xs text-amber-600">{state.emailError}</p>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="soft"
          onClick={() => {
            window.location.href = "/app/admin/tenants";
          }}
        >
          Create another tenant
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 px-5 py-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
          Create tenant
        </p>
        <p className="text-sm text-ink-500">
          Creates a new tenant, owner user, membership, and subscription.
        </p>
      </div>
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
            Tenant name
          </label>
          <Input name="tenantName" placeholder="Acme Services Ltd" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
            Owner name
          </label>
          <Input name="ownerName" placeholder="Owner User" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
            Owner email
          </label>
          <Input name="ownerEmail" type="email" placeholder="owner@acme.test" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
            Temporary password
          </label>
          <div className="flex items-center gap-2">
            <Input name="ownerPassword" type="text" value={tempPassword} readOnly />
            <Button type="button" variant="outline" onClick={() => setTempPassword(generateTempPassword())}>
              Regenerate
            </Button>
            <Button type="button" variant="outline" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
            Plan
          </label>
          <select
            name="planId"
            required
            className="h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm shadow-sm"
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ({plan.billingPeriod})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
            Status
          </label>
          <select
            name="status"
            className="h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm shadow-sm"
            defaultValue="TRIAL"
          >
            <option value="TRIAL">TRIAL</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAST_DUE">PAST_DUE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        <div className="flex items-end">
          <SubmitButton />
        </div>
        {state.status === "error" && (
          <p className="text-sm text-rose-600">{state.message}</p>
        )}
      </form>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create tenant"}
    </Button>
  );
}
