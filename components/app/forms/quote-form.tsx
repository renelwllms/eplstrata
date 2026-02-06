"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useToast } from "../../ui/toast";

type LineItem = {
  description: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  isOptional: boolean;
};

export function QuoteForm({
  clients,
  jobs,
  templates,
  mode = "create",
  quoteId,
  initial
}: {
  clients: { id: string; name: string }[];
  jobs: { id: string; name: string }[];
  templates: { id: string; name: string }[];
  mode?: "create" | "edit";
  quoteId?: string;
  initial?: {
    number?: string | null;
    clientId?: string | null;
    jobId?: string | null;
    templateId?: string | null;
    status?: string | null;
    approvalStatus?: string | null;
    isMaster?: boolean | null;
    lineItems?: LineItem[];
  };
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [items, setItems] = useState<LineItem[]>(
    initial?.lineItems?.length
      ? initial.lineItems
      : [{ description: "", quantity: 1, rate: 0, discountPercent: 0, isOptional: false }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      clientId: formData.get("clientId"),
      jobId: formData.get("jobId") || undefined,
      templateId: formData.get("templateId") || undefined,
      number: formData.get("number") || undefined,
      status: formData.get("status"),
      approvalStatus: formData.get("approvalStatus"),
      isMaster: formData.get("isMaster") === "true",
      lineItems: items
    };

    const nextErrors: Record<string, string> = {};
    if (!payload.clientId) nextErrors.clientId = "Client is required.";
    if (items.some((item) => !item.description)) {
      nextErrors.lineItems = "Each line item needs a description.";
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(quoteId ? `/api/quotes/${quoteId}` : "/api/quotes", {
        method: quoteId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to create quote");
      }

      router.push("/app/quotes");
      router.refresh();
      addToast({ title: mode === "edit" ? "Quote updated" : "Quote created", variant: "success" });
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
          <label className="text-xs font-semibold uppercase text-ink-700">Job</label>
          <select
            name="jobId"
            defaultValue={initial?.jobId ?? ""}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="">No job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Quote number</label>
          {mode === "edit" ? (
            <Input readOnly value={initial?.number ?? ""} />
          ) : (
            <Input value="Auto-generated" readOnly />
          )}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Template</label>
          <select
            name="templateId"
            defaultValue={initial?.templateId ?? ""}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="">Default</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Status</label>
          <select
            name="status"
            defaultValue={initial?.status ?? "DRAFT"}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DECLINED">Declined</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Approval status</label>
          <select
            name="approvalStatus"
            defaultValue={initial?.approvalStatus ?? "PENDING"}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Master quote</label>
          <select
            name="isMaster"
            defaultValue={String(initial?.isMaster ?? false)}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        <p className="text-xs font-semibold uppercase text-ink-700">Line items</p>
        {fieldErrors.lineItems && <p className="text-xs text-rose-600">{fieldErrors.lineItems}</p>}
        {items.map((item, index) => (
          <div key={`item-${index}`} className="grid gap-3 rounded-2xl bg-white/70 p-4 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase text-ink-700">Description</label>
              <Input
                value={item.description}
                onChange={(event) => updateItem(index, { description: event.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-ink-700">Qty</label>
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-ink-700">Rate</label>
              <Input
                type="number"
                min={0}
                value={item.rate}
                onChange={(event) => updateItem(index, { rate: Number(event.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-ink-700">Discount %</label>
              <Input
                type="number"
                min={0}
                value={item.discountPercent}
                onChange={(event) => updateItem(index, { discountPercent: Number(event.target.value) })}
              />
            </div>
            <div className="sm:col-span-5 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-ink-700">
                <input
                  type="checkbox"
                  checked={item.isOptional}
                  onChange={(event) => updateItem(index, { isOptional: event.target.checked })}
                />
                Optional item
              </label>
              {items.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== index))}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setItems((prev) => [...prev, { description: "", quantity: 1, rate: 0, discountPercent: 0, isOptional: false }])
          }
        >
          Add line item
        </Button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "edit" ? "Update quote" : "Create quote"}
        </Button>
      </div>
    </form>
  );
}
