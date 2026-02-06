"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { useToast } from "../../ui/toast";

export function LeadForm({
  stages,
  owners,
  mode = "create",
  leadId,
  initial
}: {
  stages: { id: string; name: string }[];
  owners: { id: string; name: string | null; email: string }[];
  mode?: "create" | "edit";
  leadId?: string;
  initial?: {
    name?: string | null;
    company?: string | null;
    stageId?: string | null;
    ownerUserId?: string | null;
    email?: string | null;
    phone?: string | null;
    estimatedValue?: number | null;
    probability?: number | null;
    expectedCloseDate?: string | null;
    source?: string | null;
    notes?: string | null;
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
      stageId: formData.get("stageId") || undefined,
      ownerUserId: formData.get("ownerUserId") || undefined,
      name: formData.get("name"),
      company: formData.get("company") || undefined,
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      estimatedValue: formData.get("estimatedValue")
        ? Number(formData.get("estimatedValue"))
        : undefined,
      probability: formData.get("probability")
        ? Number(formData.get("probability"))
        : undefined,
      expectedCloseDate: formData.get("expectedCloseDate") || undefined,
      source: formData.get("source") || undefined,
      notes: formData.get("notes") || undefined
    };

    const nextErrors: Record<string, string> = {};
    if (!payload.name) nextErrors.name = "Lead name is required.";
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(leadId ? `/api/leads/${leadId}` : "/api/leads", {
        method: leadId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to create lead");
      }

      router.push("/app/leads");
      router.refresh();
      addToast({ title: mode === "edit" ? "Lead updated" : "Lead created", variant: "success" });
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
          <label className="text-xs font-semibold uppercase text-ink-700">Lead name</label>
          <Input name="name" required defaultValue={initial?.name ?? ""} />
          {fieldErrors.name && <p className="text-xs text-rose-600">{fieldErrors.name}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Company</label>
          <Input name="company" defaultValue={initial?.company ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Stage</label>
          <select
            name="stageId"
            defaultValue={initial?.stageId ?? ""}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="">Default stage</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Owner</label>
          <select
            name="ownerUserId"
            defaultValue={initial?.ownerUserId ?? ""}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="">Unassigned</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name ?? owner.email}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Email</label>
          <Input name="email" type="email" defaultValue={initial?.email ?? ""} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Phone</label>
          <Input name="phone" placeholder="04 123 4567" defaultValue={initial?.phone ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Estimated value</label>
          <Input name="estimatedValue" type="number" min={0} defaultValue={initial?.estimatedValue ?? ""} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Probability %</label>
          <Input name="probability" type="number" min={0} max={100} defaultValue={initial?.probability ?? ""} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Expected close</label>
          <Input name="expectedCloseDate" type="date" defaultValue={initial?.expectedCloseDate ?? ""} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Source</label>
        <Input name="source" defaultValue={initial?.source ?? ""} />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Notes</label>
        <Textarea name="notes" defaultValue={initial?.notes ?? ""} />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "edit" ? "Update lead" : "Create lead"}
        </Button>
      </div>
    </form>
  );
}
