"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";

export type OfflineTimeEntry = {
  id: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

const STORAGE_KEY = "strata.offline.timeEntries";

function readQueue(): OfflineTimeEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OfflineTimeEntry[];
  } catch {
    return [];
  }
}

function writeQueue(entries: OfflineTimeEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function queueOfflineEntry(payload: Record<string, unknown>) {
  const entries = readQueue();
  entries.push({
    id: crypto.randomUUID(),
    payload,
    createdAt: new Date().toISOString()
  });
  writeQueue(entries);
}

export function OfflineQueueBanner({ disabled }: { disabled?: boolean }) {
  const [entries, setEntries] = useState<OfflineTimeEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const pendingCount = entries.length;
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  const sortedEntries = useMemo(
    () => entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [entries]
  );

  useEffect(() => {
    setEntries(readQueue());
  }, []);

  async function syncQueue() {
    if (!isOnline || pendingCount === 0) return;
    setSyncing(true);
    setStatus(null);

    const remaining: OfflineTimeEntry[] = [];
    for (const entry of sortedEntries) {
      try {
        const response = await fetch("/api/time-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry.payload)
        });

        if (!response.ok) {
          const body = await response.json();
          if (body?.error === "Timesheet submitted") {
            remaining.push(entry);
            setStatus("Some entries require review due to submitted timesheets.");
          } else {
            remaining.push(entry);
          }
        }
      } catch {
        remaining.push(entry);
      }
    }

    writeQueue(remaining);
    setEntries(remaining);
    setSyncing(false);
  }

  useEffect(() => {
    function handleOnline() {
      syncQueue();
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [sortedEntries]);

  if (disabled) {
    return (
      <div className="rounded-2xl bg-rose-100 p-4 text-sm text-rose-700">
        Offline queue disabled in read-only mode.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/70 p-4 text-sm text-ink-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Offline queue</p>
          <p className="text-xs text-ink-700">
            {pendingCount} pending time entries {isOnline ? "" : "(offline)"}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={syncQueue} disabled={syncing || !isOnline || pendingCount === 0}>
          {syncing ? "Syncing..." : "Sync now"}
        </Button>
      </div>
      {status && <p className="mt-2 text-xs text-rose-700">{status}</p>}
    </div>
  );
}
