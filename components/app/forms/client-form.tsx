"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { useToast } from "../../ui/toast";

export function ClientForm({
  mode = "create",
  clientId,
  initial
}: {
  mode?: "create" | "edit";
  clientId?: string;
  initial?: {
    name: string;
    status?: string | null;
    billingEmail?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    region?: string | null;
    postalCode?: string | null;
    country?: string | null;
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
      name: formData.get("name"),
      status: formData.get("status"),
      billingEmail: formData.get("billingEmail"),
      phone: formData.get("phone"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2"),
      city: formData.get("city"),
      region: formData.get("region"),
      postalCode: formData.get("postalCode"),
      country: formData.get("country"),
      notes: formData.get("notes")
    };

    const nextErrors: Record<string, string> = {};
    if (!payload.name) {
      nextErrors.name = "Client name is required.";
    }
    if (payload.billingEmail && typeof payload.billingEmail === "string" && !payload.billingEmail.includes("@")) {
      nextErrors.billingEmail = "Enter a valid email.";
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(clientId ? `/api/clients/${clientId}` : "/api/clients", {
        method: clientId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to create client");
      }

      router.push("/app/clients");
      router.refresh();
      addToast({ title: mode === "edit" ? "Client updated" : "Client created", variant: "success" });
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
          <label className="text-xs font-semibold uppercase text-ink-700">Client name</label>
          <Input name="name" required defaultValue={initial?.name ?? ""} />
          {fieldErrors.name && <p className="text-xs text-rose-600">{fieldErrors.name}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Status</label>
          <select
            name="status"
            defaultValue={initial?.status ?? "ACTIVE"}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Billing email</label>
          <Input name="billingEmail" type="email" defaultValue={initial?.billingEmail ?? ""} />
          {fieldErrors.billingEmail && <p className="text-xs text-rose-600">{fieldErrors.billingEmail}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Phone</label>
          <Input name="phone" placeholder="04 123 4567" defaultValue={initial?.phone ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Address line 1</label>
          <Input name="addressLine1" defaultValue={initial?.addressLine1 ?? ""} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Address line 2</label>
          <Input name="addressLine2" defaultValue={initial?.addressLine2 ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">City</label>
          <Input name="city" defaultValue={initial?.city ?? ""} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Region</label>
          <Input name="region" defaultValue={initial?.region ?? ""} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Postal code</label>
          <Input name="postalCode" defaultValue={initial?.postalCode ?? ""} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Country</label>
        <Input name="country" defaultValue={initial?.country ?? ""} />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Notes</label>
        <Textarea name="notes" defaultValue={initial?.notes ?? ""} />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "edit" ? "Update client" : "Create client"}
        </Button>
      </div>
    </form>
  );
}
