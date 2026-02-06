"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { useTimerState } from "./use-timer";

type JobOption = { id: string; name: string };
type TaskOption = { id: string; name: string };

function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function TimerOverlay() {
  const { timer, elapsedSeconds, pauseTimer, resumeTimer, stopTimer } = useTimerState();
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [tasks, setTasks] = useState<TaskOption[]>([]);

  useEffect(() => {
    if (!timer) return;
    Promise.all([fetch("/api/jobs").then((res) => res.json()), fetch("/api/tasks").then((res) => res.json())])
      .then(([jobsResponse, tasksResponse]) => {
        const jobList: JobOption[] = Array.isArray(jobsResponse?.data)
          ? jobsResponse.data.map((job: { id: string; name: string }) => ({
              id: job.id,
              name: job.name
            }))
          : [];
        const taskList: TaskOption[] = Array.isArray(tasksResponse?.data)
          ? tasksResponse.data.map((task: { id: string; name: string }) => ({
              id: task.id,
              name: task.name
            }))
          : [];
        setJobs(jobList);
        setTasks(taskList);
      })
      .catch(() => {
        setJobs([]);
        setTasks([]);
      });
  }, [timer]);

  const jobName = useMemo(() => {
    if (!timer) return "";
    return jobs.find((job) => job.id === timer.jobId)?.name ?? "Selected job";
  }, [jobs, timer]);

  const taskName = useMemo(() => {
    if (!timer) return "";
    return tasks.find((task) => task.id === timer.taskId)?.name ?? "Selected task";
  }, [tasks, timer]);

  if (!timer) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 print:hidden">
      <div className="w-full max-w-2xl rounded-3xl border border-sand-200 bg-white/95 px-5 py-4 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-ink-500">{timer.status === "running" ? "Timer running" : "Timer paused"}</p>
            <p className="text-sm font-semibold text-ink-700">{jobName}</p>
            <p className="text-xs text-ink-500">{taskName}</p>
          </div>
          <div className="text-2xl font-semibold text-ink-700">{formatElapsed(elapsedSeconds)}</div>
          <div className="flex items-center gap-2">
            {timer.status === "running" ? (
              <Button variant="outline" size="sm" onClick={pauseTimer}>
                Pause
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={resumeTimer}>
                Resume
              </Button>
            )}
            <Button size="sm" onClick={stopTimer}>
              Stop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
