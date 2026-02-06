"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { useToast } from "../../ui/toast";

export function DocumentForm({
  documentId,
  initial
}: {
  documentId: string;
  initial: { title: string; description?: string | null };
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
      title: formData.get("title"),
      description: formData.get("description") || undefined
    };

    const nextErrors: Record<string, string> = {};
    if (!payload.title) nextErrors.title = "Title is required.";
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to update document");
      }

      router.push("/app/documents");
      router.refresh();
      addToast({ title: "Document updated", variant: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      addToast({ title: "Save failed", description: "Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-4">
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Title</label>
        <Input name="title" required defaultValue={initial.title} />
        {fieldErrors.title && <p className="text-xs text-rose-600">{fieldErrors.title}</p>}
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Description</label>
        <Textarea name="description" defaultValue={initial.description ?? ""} />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Update document"}
        </Button>
      </div>
    </form>
  );
}
