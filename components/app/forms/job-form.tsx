"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useToast } from "../../ui/toast";

export function JobForm({
  clients,
  members,
  mode = "create",
  jobId,
  initial
}: {
  clients: { id: string; name: string }[];
  members: { id: string; name: string; role: string }[];
  mode?: "create" | "edit";
  jobId?: string;
  initial?: {
    jobNumber?: string | null;
    clientId?: string | null;
    name?: string | null;
    status?: string | null;
    startDate?: string | null;
    dueDate?: string | null;
    budgetMinutes?: number | null;
    assigneeIds?: string[];
  };
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      clientId: formData.get("clientId"),
      jobNumber: formData.get("jobNumber") || undefined,
      name: formData.get("name"),
      status: formData.get("status"),
      startDate: formData.get("startDate") || undefined,
      dueDate: formData.get("dueDate") || undefined,
      budgetMinutes: formData.get("budgetMinutes") ? Number(formData.get("budgetMinutes")) : undefined,
      assigneeIds: formData.getAll("assignees").map((value) => String(value))
    };

    const nextErrors: Record<string, string> = {};
    if (!payload.clientId) nextErrors.clientId = "Client is required.";
    if (!payload.name) nextErrors.name = "Job name is required.";
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(jobId ? `/api/jobs/${jobId}` : "/api/jobs", {
        method: jobId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to create job");
      }

      router.push("/app/jobs");
      router.refresh();
      addToast({ title: mode === "edit" ? "Job updated" : "Job created", variant: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      addToast({ title: "Save failed", description: "Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Client</label>
          <select
            name="clientId"
            required
            defaultValue={initial?.clientId ?? ""}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {fieldErrors.clientId && <p className="text-xs text-rose-600">{fieldErrors.clientId}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Job number</label>
          {mode === "edit" ? (
            <Input readOnly value={initial?.jobNumber ?? ""} />
          ) : (
            <Input value="Auto-generated" readOnly />
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Job name</label>
          <Input name="name" required defaultValue={initial?.name ?? ""} />
          {fieldErrors.name && <p className="text-xs text-rose-600">{fieldErrors.name}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Status</label>
          <select
            name="status"
            defaultValue={initial?.status ?? "QUOTE"}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="QUOTE">Quote</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Start date</label>
          <Input name="startDate" type="date" defaultValue={initial?.startDate ?? ""} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Due date</label>
          <Input name="dueDate" type="date" defaultValue={initial?.dueDate ?? ""} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Budget (minutes)</label>
          <Input name="budgetMinutes" type="number" min={0} defaultValue={initial?.budgetMinutes ?? ""} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Assign team members</label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <label
              key={member.id}
              className="flex items-center gap-2 rounded-xl border border-sand-200 bg-white/80 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name="assignees"
                value={member.id}
                defaultChecked={initial?.assigneeIds?.includes(member.id)}
              />
              <span className="text-ink-900">{member.name}</span>
              <span className="ml-auto text-xs text-ink-500">{member.role}</span>
            </label>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "edit" ? "Update job" : "Create job"}
        </Button>
      </div>
    </form>
  );
}
