"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { useToast } from "../../ui/toast";

type BulkItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  href: string;
};

export function BulkList({
  items,
  resource,
  emptyText
}: {
  items: BulkItem[];
  resource: string;
  emptyText: string;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = useMemo(() => items.length > 0 && selected.size === items.length, [items, selected]);

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((item) => item.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDelete() {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} item(s)?`)) return;

    const ids = Array.from(selected);
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/${resource}/${id}`, { method: "DELETE" }))
      );
      addToast({ title: "Deleted", variant: "success" });
      setSelected(new Set());
      router.refresh();
    } catch {
      addToast({ title: "Delete failed", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <div className="grid gap-3">
      {items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-700">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            Select all
          </label>
          <Button type="button" size="sm" variant="outline" onClick={handleDelete} disabled={selected.size === 0}>
            Delete selected
          </Button>
        </div>
      )}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-4">
          <input
            type="checkbox"
            checked={selected.has(item.id)}
            onChange={() => toggleOne(item.id)}
          />
          <a href={item.href} className="flex flex-1 items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              {item.subtitle && <p className="text-xs text-ink-700">{item.subtitle}</p>}
            </div>
            {item.meta && <span className="text-xs text-ink-700">{item.meta}</span>}
          </a>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-ink-700">{emptyText}</p>}
    </div>
  );
}
