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
};

export function InvoiceForm({
  clients,
  jobs,
  templates,
  mode = "create",
  invoiceId,
  initial
}: {
  clients: { id: string; name: string }[];
  jobs: { id: string; name: string; clientId: string }[];
  templates: { id: string; name: string }[];
  mode?: "create" | "edit";
  invoiceId?: string;
  initial?: {
    number?: string | null;
    clientId?: string | null;
    templateId?: string | null;
    status?: string | null;
    billingMode?: string | null;
    progressPercent?: number | null;
    jobIds?: string[];
    lineItems?: LineItem[];
  };
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [items, setItems] = useState<LineItem[]>(
    initial?.lineItems?.length
      ? initial.lineItems
      : [{ description: "", quantity: 1, rate: 0, discountPercent: 0 }]
  );
  const [selectedJobs, setSelectedJobs] = useState<string[]>(initial?.jobIds ?? []);
  const [selectedClientId, setSelectedClientId] = useState<string>(initial?.clientId ?? "");
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
      jobId: selectedJobs[0] || formData.get("jobId") || undefined,
      jobIds: selectedJobs.length > 1 ? selectedJobs : undefined,
      templateId: formData.get("templateId") || undefined,
      number: formData.get("number") || undefined,
      status: formData.get("status"),
      billingMode: formData.get("billingMode"),
      progressPercent: formData.get("progressPercent")
        ? Number(formData.get("progressPercent"))
        : undefined,
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
      const response = await fetch(invoiceId ? `/api/invoices/${invoiceId}` : "/api/invoices", {
        method: invoiceId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to create invoice");
      }

      router.push("/app/invoices");
      router.refresh();
      addToast({ title: mode === "edit" ? "Invoice updated" : "Invoice created", variant: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      addToast({ title: "Save failed", description: "Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  const filteredJobs = selectedClientId
    ? jobs.filter((job) => job.clientId === selectedClientId)
    : jobs;

  return (
    <form action={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Client</label>
          <select
            name="clientId"
            required
            defaultValue={initial?.clientId ?? ""}
            onChange={(event) => {
              const nextClientId = event.target.value;
              setSelectedClientId(nextClientId);
              if (nextClientId) {
                setSelectedJobs((prev) => prev.filter((jobId) => {
                  const job = jobs.find((item) => item.id === jobId);
                  return job?.clientId === nextClientId;
                }));
              } else {
                setSelectedJobs([]);
              }
            }}
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
          <label className="text-xs font-semibold uppercase text-ink-700">Invoice number</label>
          {mode === "edit" ? (
            <Input readOnly value={initial?.number ?? ""} />
          ) : (
            <Input value="Auto-generated" readOnly />
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
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
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="VOID">Void</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Billing mode</label>
          <select
            name="billingMode"
            defaultValue={initial?.billingMode ?? "ACTUAL"}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            <option value="ACTUAL">Actual</option>
            <option value="QUOTED">Quoted</option>
            <option value="PROGRESS">Progress</option>
            <option value="PERCENT_QUOTE">Percent of quote</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Progress percent</label>
          <Input
            name="progressPercent"
            type="number"
            min={0}
            max={100}
            defaultValue={initial?.progressPercent ?? ""}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Jobs</label>
          <select
            name="jobIds"
            multiple
            value={selectedJobs}
            onChange={(event) => {
              const values = Array.from(event.target.selectedOptions).map((option) => option.value);
              setSelectedJobs(values);
            }}
            className="mt-1 h-24 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            {filteredJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        <p className="text-xs font-semibold uppercase text-ink-700">Line items</p>
        {fieldErrors.lineItems && <p className="text-xs text-rose-600">{fieldErrors.lineItems}</p>}
        {items.map((item, index) => (
          <div key={`item-${index}`} className="grid gap-3 rounded-2xl bg-white/70 p-4 sm:grid-cols-4">
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
            <div className="sm:col-span-4">
              <label className="text-xs font-semibold uppercase text-ink-700">Discount %</label>
              <Input
                type="number"
                min={0}
                value={item.discountPercent}
                onChange={(event) => updateItem(index, { discountPercent: Number(event.target.value) })}
              />
            </div>
            <div className="sm:col-span-4 flex justify-end">
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
            setItems((prev) => [...prev, { description: "", quantity: 1, rate: 0, discountPercent: 0 }])
          }
        >
          Add line item
        </Button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "edit" ? "Update invoice" : "Create invoice"}
        </Button>
      </div>
    </form>
  );
}
