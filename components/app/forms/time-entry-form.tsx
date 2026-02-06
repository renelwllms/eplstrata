"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { cn } from "../../../lib/utils";
import { useToast } from "../../ui/toast";

export function TimeEntryForm({
  jobs,
  tasks,
  mode = "create",
  entryId,
  initial
}: {
  jobs: { id: string; name: string }[];
  tasks: { id: string; name: string }[];
  mode?: "create" | "edit";
  entryId?: string;
  initial?: {
    jobId?: string | null;
    taskCatalogId?: string | null;
    date?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    durationMinutes?: number | null;
    billable?: boolean | null;
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

    const startTime = formData.get("startTime") || undefined;
    const endTime = formData.get("endTime") || undefined;
    const durationMinutes = formData.get("durationMinutes")
      ? Number(formData.get("durationMinutes"))
      : startTime && endTime
        ? Math.max(
            1,
            Math.round((new Date(endTime as string).getTime() - new Date(startTime as string).getTime()) / 60000)
          )
        : undefined;

    const payload = {
      jobId: formData.get("jobId"),
      taskCatalogId: formData.get("taskCatalogId"),
      date: formData.get("date"),
      startTime,
      endTime,
      durationMinutes,
      billable: formData.get("billable") === "true",
      notes: formData.get("notes") || undefined
    };

    const nextErrors: Record<string, string> = {};
    if (!payload.date) nextErrors.date = "Date is required.";
    if (!payload.jobId) nextErrors.jobId = "Job is required.";
    if (!payload.taskCatalogId) nextErrors.taskCatalogId = "Task is required.";
    if (!durationMinutes) nextErrors.durationMinutes = "Duration or start/end time required.";
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(entryId ? `/api/time-entries/${entryId}` : "/api/time-entries", {
        method: entryId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to create time entry");
      }

      router.push("/app/time");
      router.refresh();
      addToast({ title: mode === "edit" ? "Time entry updated" : "Time entry created", variant: "success" });
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
          <label className="text-xs font-semibold uppercase text-ink-700">Date</label>
          <Input name="date" type="date" required defaultValue={initial?.date ?? ""} />
          {fieldErrors.date && <p className="text-xs text-rose-600">{fieldErrors.date}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Duration (min)</label>
          <Input
            name="durationMinutes"
            type="number"
            min={1}
            defaultValue={initial?.durationMinutes ?? ""}
          />
          {fieldErrors.durationMinutes && <p className="text-xs text-rose-600">{fieldErrors.durationMinutes}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">Start time</label>
          <Input name="startTime" type="datetime-local" defaultValue={initial?.startTime ?? ""} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-ink-700">End time</label>
          <Input name="endTime" type="datetime-local" defaultValue={initial?.endTime ?? ""} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Job</label>
        <select
          name="jobId"
          required
          defaultValue={initial?.jobId ?? ""}
          className={cn("mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm")}
        >
          <option value="">Select job</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
        {fieldErrors.jobId && <p className="text-xs text-rose-600">{fieldErrors.jobId}</p>}
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Task</label>
        <select
          name="taskCatalogId"
          required
          defaultValue={initial?.taskCatalogId ?? ""}
          className={cn("mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm")}
        >
          <option value="">Select task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name}
            </option>
          ))}
        </select>
        {fieldErrors.taskCatalogId && <p className="text-xs text-rose-600">{fieldErrors.taskCatalogId}</p>}
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Billable</label>
        <select
          name="billable"
          defaultValue={String(initial?.billable ?? true)}
          className={cn("mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm")}
        >
          <option value="true">Billable</option>
          <option value="false">Non-billable</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-ink-700">Notes</label>
        <Textarea name="notes" defaultValue={initial?.notes ?? ""} />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "edit" ? "Update time entry" : "Create time entry"}
        </Button>
      </div>
    </form>
  );
}
