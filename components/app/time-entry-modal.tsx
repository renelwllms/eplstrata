"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";
import { queueOfflineEntry } from "./offline-time-queue";

export function TimeEntryModal({
  jobs,
  tasks,
  disabled
}: {
  jobs: { id: string; name: string }[];
  tasks: { id: string; name: string }[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const startTime = timerStart ? new Date(timerStart) : null;
    const endTime = timerRunning ? new Date() : null;
    const durationMinutes = timerRunning && startTime
      ? Math.max(1, Math.round((Date.now() - startTime.getTime()) / 60000))
      : Number(formData.get("durationMinutes"));

    const payload = {
      jobId: formData.get("jobId"),
      taskCatalogId: formData.get("taskCatalogId"),
      date: formData.get("date"),
      durationMinutes,
      startTime: startTime ? startTime.toISOString() : undefined,
      endTime: endTime ? endTime.toISOString() : undefined,
      source: timerRunning ? "timer" : "manual",
      notes: formData.get("notes")
    };

    if (!payload.jobId || !payload.taskCatalogId || !payload.date) {
      setError("Job, task, and date are required.");
      setLoading(false);
      return;
    }

    if (!timerRunning && (!durationMinutes || Number.isNaN(durationMinutes))) {
      setError("Duration is required.");
      setLoading(false);
      return;
    }

    try {
      if (!navigator.onLine) {
        queueOfflineEntry(payload as Record<string, unknown>);
        setOpen(false);
        setTimerRunning(false);
        setTimerStart(null);
        return;
      }

      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to save time entry");
      }

      setOpen(false);
      setTimerRunning(false);
      setTimerStart(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>Add time entry</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>New time entry</DialogTitle>
        <DialogDescription>Log time against a job and task.</DialogDescription>
        <form action={handleSubmit} className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand-100 px-4 py-3 text-sm">
            <div>
              <p className="font-semibold">Timer</p>
              <p className="text-xs text-ink-700">
                {timerRunning && timerStart
                  ? `Started ${timerStart.toLocaleTimeString()}`
                  : "Track time automatically"}
              </p>
            </div>
            <Button
              type="button"
              variant={timerRunning ? "primary" : "outline"}
              onClick={() => {
                if (timerRunning) {
                  setTimerRunning(false);
                } else {
                  setTimerRunning(true);
                  setTimerStart(new Date());
                }
              }}
            >
              {timerRunning ? "Stop timer" : "Start timer"}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-ink-700">Date</label>
              <Input name="date" type="date" required />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-ink-700">Duration (min)</label>
              <Input name="durationMinutes" type="number" min={1} required disabled={timerRunning} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-ink-700">Job</label>
            <select
              name="jobId"
              required
              className={cn(
                "mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm shadow-sm"
              )}
            >
              <option value="">Select job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-ink-700">Task</label>
            <select
              name="taskCatalogId"
              required
              className={cn(
                "mt-1 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm shadow-sm"
              )}
            >
              <option value="">Select task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-ink-700">Notes</label>
            <Textarea name="notes" placeholder="Describe the work completed" />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
