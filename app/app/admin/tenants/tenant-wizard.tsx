"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "../../../../components/ui/dialog";
import { createTenantUsers, createTenantWithOwner } from "./actions";
import type { CreateTenantState } from "./types";

type Plan = {
  id: string;
  name: string;
  billingPeriod: "MONTH" | "YEAR";
};

type WizardUser = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "STAFF";
  password: string;
};

type UsersState = { status: "idle" | "error" | "success"; message?: string };

function generateTempPassword() {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 14; i += 1) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  return password;
}

function createEmptyUser(): WizardUser {
  return {
    id: crypto.randomUUID(),
    name: "",
    email: "",
    role: "STAFF",
    password: generateTempPassword()
  };
}

export function TenantOnboardingWizard({ plans }: { plans: Plan[] }) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [createdTenantId, setCreatedTenantId] = React.useState<string | null>(null);
  const [createdTenantName, setCreatedTenantName] = React.useState<string>("");
  const [users, setUsers] = React.useState<WizardUser[]>([createEmptyUser()]);

  const [tenantState, tenantAction] = useFormState<CreateTenantState, FormData>(
    createTenantWithOwner,
    { status: "idle", message: "" }
  );

  const [usersState, usersAction] = useFormState<UsersState, FormData>(
    createTenantUsers,
    { status: "idle" }
  );

  React.useEffect(() => {
    if (tenantState.status === "success") {
      setCreatedTenantId(tenantState.tenantId);
      setCreatedTenantName(tenantState.tenantName);
      setStep(2);
    }
  }, [tenantState]);

  React.useEffect(() => {
    if (usersState.status === "success") {
      setStep(3);
    }
  }, [usersState.status]);

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    setCreatedTenantId(null);
    setCreatedTenantName("");
    setUsers([createEmptyUser()]);
  };

  const updateUser = (id: string, patch: Partial<WizardUser>) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  };

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const addUser = () => {
    setUsers((prev) => [...prev, createEmptyUser()]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 z-40 rounded-full shadow-soft">
          New tenant wizard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <div className="space-y-2">
          <DialogTitle>Tenant onboarding</DialogTitle>
          <DialogDescription>
            Step {step} of 3
          </DialogDescription>
        </div>

        {step === 1 && (
          <Card className="space-y-4 px-5 py-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
                Create tenant
              </p>
              <p className="text-sm text-ink-500">
                Creates a new tenant, owner user, membership, and subscription.
              </p>
            </div>
            <form action={tenantAction} className="grid gap-4 md:grid-cols-2">
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
                <Input name="ownerPassword" type="text" defaultValue={generateTempPassword()} />
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
              <div className="flex items-end gap-2">
                <TenantSubmitButton />
                <Button type="button" variant="outline" onClick={handleClose}>
                  Skip for now
                </Button>
              </div>
              {tenantState.status === "error" && (
                <p className="text-sm text-rose-600">{tenantState.message}</p>
              )}
            </form>
          </Card>
        )}

        {step === 2 && createdTenantId && (
          <Card className="space-y-4 px-5 py-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
                Add users
              </p>
              <p className="text-sm text-ink-500">
                Tenant: <span className="font-semibold text-ink-700">{createdTenantName}</span>
              </p>
            </div>
            <form action={usersAction} className="space-y-4">
              <input type="hidden" name="tenantId" value={createdTenantId} />
              <input type="hidden" name="users" value={JSON.stringify(users)} />
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="grid gap-3 rounded-2xl border border-sand-100 bg-sand-50 p-4 md:grid-cols-[1.2fr,1.4fr,0.8fr,1fr,auto]">
                    <Input
                      placeholder="Name"
                      value={user.name}
                      onChange={(event) => updateUser(user.id, { name: event.target.value })}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={user.email}
                      onChange={(event) => updateUser(user.id, { email: event.target.value })}
                    />
                    <select
                      className="h-10 rounded-xl border border-sand-200 bg-white/80 px-3 text-sm shadow-sm"
                      value={user.role}
                      onChange={(event) => updateUser(user.id, { role: event.target.value as WizardUser["role"] })}
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="STAFF">STAFF</option>
                    </select>
                    <Input
                      placeholder="Temp password"
                      value={user.password}
                      onChange={(event) => updateUser(user.id, { password: event.target.value })}
                    />
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={() => updateUser(user.id, { password: generateTempPassword() })}>
                        Regenerate
                      </Button>
                      <Button type="button" variant="outline" onClick={() => removeUser(user.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" onClick={addUser}>
                  Add user
                </Button>
                <UsersSubmitButton />
                <Button type="button" variant="outline" onClick={handleClose}>
                  Skip for now
                </Button>
              </div>
              {usersState.status === "error" && (
                <p className="text-sm text-rose-600">{usersState.message}</p>
              )}
            </form>
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-4 px-5 py-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500">
                Complete
              </p>
              <p className="text-sm text-ink-500">
                Tenant and users created successfully.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            </div>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TenantSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create tenant"}
    </Button>
  );
}

function UsersSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Create users"}
    </Button>
  );
}
