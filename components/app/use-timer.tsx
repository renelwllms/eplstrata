"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type TimerStatus = "running" | "paused";
type TimerState = {
  status: TimerStatus;
  jobId: string;
  taskId: string;
  note?: string;
  startedAt?: string;
  elapsedSeconds: number;
};

const STORAGE_KEY = "strata:timer";
const EVENT_NAME = "strata:timer";

function readTimer(): TimerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TimerState) : null;
  } catch {
    return null;
  }
}

function writeTimer(next: TimerState | null) {
  if (typeof window === "undefined") return;
  try {
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useTimerState() {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTimer(readTimer());
    const handle = () => setTimer(readTimer());
    window.addEventListener(EVENT_NAME, handle);
    window.addEventListener("storage", handle);
    return () => {
      window.removeEventListener(EVENT_NAME, handle);
      window.removeEventListener("storage", handle);
    };
  }, []);

  useEffect(() => {
    if (!timer || timer.status !== "running") return;
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [timer]);

  const elapsedSeconds = useMemo(() => {
    if (!timer) return 0;
    if (timer.status === "running" && timer.startedAt) {
      const started = new Date(timer.startedAt).getTime();
      const now = Date.now();
      const delta = Math.max(0, Math.floor((now - started) / 1000));
      return timer.elapsedSeconds + delta;
    }
    return timer.elapsedSeconds;
  }, [timer, tick]);

  const startTimer = useCallback((payload: { jobId: string; taskId: string; note?: string }) => {
    writeTimer({
      status: "running",
      jobId: payload.jobId,
      taskId: payload.taskId,
      note: payload.note,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0
    });
  }, []);

  const pauseTimer = useCallback(() => {
    const current = readTimer();
    if (!current || current.status !== "running") return;
    const started = current.startedAt ? new Date(current.startedAt).getTime() : Date.now();
    const delta = Math.max(0, Math.floor((Date.now() - started) / 1000));
    writeTimer({
      ...current,
      status: "paused",
      elapsedSeconds: current.elapsedSeconds + delta,
      startedAt: undefined
    });
  }, []);

  const resumeTimer = useCallback(() => {
    const current = readTimer();
    if (!current || current.status !== "paused") return;
    writeTimer({
      ...current,
      status: "running",
      startedAt: new Date().toISOString()
    });
  }, []);

  const stopTimer = useCallback(async () => {
    const current = readTimer();
    if (!current) return;
    const totalSeconds = (() => {
      if (current.status === "running" && current.startedAt) {
        const delta = Math.max(0, Math.floor((Date.now() - new Date(current.startedAt).getTime()) / 1000));
        return current.elapsedSeconds + delta;
      }
      return current.elapsedSeconds;
    })();
    const durationMinutes = Math.max(1, Math.round(totalSeconds / 60));
    const today = new Date().toISOString().slice(0, 10);

    await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: current.jobId,
        taskCatalogId: current.taskId,
        date: today,
        durationMinutes,
        source: "timer",
        notes: current.note || undefined
      })
    });

    writeTimer(null);
  }, []);

  const clearTimer = useCallback(() => writeTimer(null), []);

  return {
    timer,
    elapsedSeconds,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    clearTimer
  };
}
