"use client";

import { useFormState } from "react-dom";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { addUserAction, type AddUserState } from "./actions";

const initialState: AddUserState = { status: "idle" };

export function AddUserForm({
  tenants,
  canSelectTenant
}: {
  tenants: { id: string; name: string }[];
  canSelectTenant: boolean;
}) {
  const [state, action] = useFormState(addUserAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      {canSelectTenant ? (
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Tenant</label>
          <select
            name="tenantId"
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
            required
          >
            <option value="">Select tenant</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Name</label>
          <Input name="name" placeholder="Owner User" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Email</label>
          <Input name="email" type="email" placeholder="owner@demo.local" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Role</label>
          <select
            name="role"
            defaultValue="STAFF"
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Temporary password</label>
          <Input name="tempPassword" type="password" placeholder="Minimum 10 characters" required />
        </div>
      </div>

      {state.status === "error" ? (
        <p className="text-sm text-rose-600">{state.message}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm text-emerald-700">{state.message}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit">Add user</Button>
      </div>
    </form>
  );
}
