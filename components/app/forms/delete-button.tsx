"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { useToast } from "../../ui/toast";

export function DeleteButton({
  endpoint,
  confirmText,
  redirectTo,
  label = "Delete",
  onDeleted
}: {
  endpoint: string;
  confirmText: string;
  redirectTo: string;
  label?: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmText)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Delete failed");
      }
      if (onDeleted) {
        onDeleted();
        return;
      }
      router.push(redirectTo);
      router.refresh();
      addToast({ title: "Deleted", variant: "success" });
    } catch {
      setLoading(false);
      addToast({ title: "Delete failed", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : label}
    </Button>
  );
}
