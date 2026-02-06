"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { useToast } from "../../ui/toast";

export function DuplicateButton({
  endpoint,
  redirectBase,
  label = "Duplicate"
}: {
  endpoint: string;
  redirectBase: string;
  label?: string;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    setLoading(true);
    try {
      const response = await fetch(endpoint, { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Duplicate failed");
      }
      const data = await response.json();
      const id = data?.data?.id;
      if (!id) {
        throw new Error("Duplicate failed");
      }
      addToast({ title: "Duplicated", variant: "success" });
      router.push(`${redirectBase}/${id}`);
      router.refresh();
    } catch {
      addToast({ title: "Duplicate failed", description: "Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleDuplicate} disabled={loading}>
      {loading ? "Duplicating..." : label}
    </Button>
  );
}
