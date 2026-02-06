 "use client";

 import { useCallback, useEffect, useMemo, useState } from "react";
 import { useTimerState } from "../../../components/app/use-timer";
 import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
   SelectTrigger,
   SelectValue
 } from "../../../components/ui/select";
 import { KpiCard } from "../../../components/app/dashboard/kpi-card";
 import {
   ApprovalAgingChart,
   PipelineFunnel,
   PipelineTimingChart,
   PipelineWinRateChart,
   RevenueChart,
   UtilizationDonut,
   UtilizationTrend
 } from "../../../components/app/dashboard/charts";
 import {
   DashboardSummary,
   PipelineSnapshot,
   ApprovalsPayload,
   UtilizationPayload,
   RevenuePayload,
   AttentionItem
 } from "../../../types/dashboard";

 const rangeOptions = [
   { value: "7d", label: "Last 7 days" },
   { value: "30d", label: "Last 30 days" },
   { value: "month", label: "This month" },
   { value: "custom", label: "Custom" }
 ];

 const teamOptions = [
   { value: "all", label: "All teams" },
   { value: "my", label: "My team" }
 ];

 const ownerOptions = [
   { value: "me", label: "Me" },
   { value: "all", label: "All owners" }
 ];

 type JobOption = { id: string; name: string };
 type TaskOption = { id: string; name: string };
 type TimerItem = { id: string; job: string; duration: string; date: string };

const formatMinutes = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

 export function DashboardClient() {
   const [range, setRange] = useState("7d");
   const [team, setTeam] = useState("all");
   const [owner, setOwner] = useState("me");
  const [revenueStacked, setRevenueStacked] = useState(true);
  const [revenueRange, setRevenueRange] = useState<"7d" | "30d">("7d");
  const [revenueCategory, setRevenueCategory] = useState<string>("");

   const [summary, setSummary] = useState<DashboardSummary | null>(null);
   const [pipeline, setPipeline] = useState<PipelineSnapshot | null>(null);
   const [approvals, setApprovals] = useState<ApprovalsPayload | null>(null);
   const [utilization, setUtilization] = useState<UtilizationPayload | null>(null);
   const [revenue, setRevenue] = useState<RevenuePayload | null>(null);
   const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);

   useEffect(() => {
     let alive = true;
    const query = `range=${range}&team=${team}&owner=${owner}`;

    Promise.all([
      fetch(`/api/dashboard/summary?${query}`).then((res) => res.json()),
      fetch(`/api/dashboard/pipeline?${query}`).then((res) => res.json()),
      fetch(`/api/dashboard/approvals?${query}`).then((res) => res.json()),
      fetch(`/api/dashboard/utilization?${query}`).then((res) => res.json()),
      fetch(`/api/dashboard/revenue?range=${revenueRange}`).then((res) => res.json()),
      fetch(`/api/dashboard/attention?${query}`).then((res) => res.json())
    ])
       .then(([summaryData, pipelineData, approvalsData, utilizationData, revenueData, attentionData]) => {
         if (!alive) return;
         setSummary(summaryData);
         setPipeline(pipelineData);
         setApprovals(approvalsData);
         setUtilization(utilizationData);
         setRevenue(revenueData);
         setAttentionItems(Array.isArray(attentionData) ? attentionData : []);
       })
       .finally(() => {});

     return () => {
       alive = false;
     };
   }, [range, team, owner, revenueRange]);

  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [timerJobId, setTimerJobId] = useState("");
  const [timerTaskId, setTimerTaskId] = useState("");
  const [timerNote, setTimerNote] = useState("");
  const [lastTimers, setLastTimers] = useState<TimerItem[]>([]);
  const { timer, elapsedSeconds, startTimer, pauseTimer, resumeTimer, stopTimer } = useTimerState();

  const formattedElapsed = useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [elapsedSeconds]);

  const loadTimerData = useCallback(async () => {
    const [jobsResponse, tasksResponse, entriesResponse] = await Promise.all([
      fetch("/api/jobs").then((res) => res.json()),
      fetch("/api/tasks").then((res) => res.json()),
      fetch("/api/time-entries").then((res) => res.json())
    ]);

    const jobList: JobOption[] = Array.isArray(jobsResponse?.data)
      ? jobsResponse.data.map((job: { id: string; name: string }) => ({
          id: job.id,
          name: job.name
        }))
      : [];
    setJobs(jobList);
    if (!timerJobId && jobList.length) {
      setTimerJobId(jobList[0].id);
    }

    const taskList: TaskOption[] = Array.isArray(tasksResponse?.data)
      ? tasksResponse.data.map((task: { id: string; name: string }) => ({
          id: task.id,
          name: task.name
        }))
      : [];
    setTasks(taskList);
    if (!timerTaskId && taskList.length) {
      setTimerTaskId(taskList[0].id);
    }

    const entries = Array.isArray(entriesResponse?.data) ? entriesResponse.data : [];
    const jobMap = new Map(jobList.map((job) => [job.id, job.name]));
    const timers: TimerItem[] = entries.slice(0, 5).map((entry: any, index: number) => {
      const date = entry?.date ? new Date(entry.date) : null;
      return {
        id: entry?.id ?? `timer-${index}`,
        job: jobMap.get(entry?.jobId) ?? "Unknown job",
        duration: formatMinutes(Number(entry?.durationMinutes ?? 0)),
        date: date ? date.toLocaleDateString("en-NZ", { weekday: "short" }) : ""
      };
    });
    setLastTimers(timers);
  }, [timerJobId, timerTaskId]);

  useEffect(() => {
    let alive = true;
    loadTimerData().catch(() => {
      if (!alive) return;
      setJobs([]);
      setTasks([]);
      setLastTimers([]);
    });
    return () => {
      alive = false;
    };
  }, [loadTimerData]);

  useEffect(() => {
    if (!timer) {
      loadTimerData().catch(() => {});
    }
  }, [timer, loadTimerData]);

  const handleToggleTimer = async () => {
    if (timer?.status === "running") {
      await pauseTimer();
      return;
    }
    if (timer?.status === "paused") {
      await resumeTimer();
      return;
    }
    if (!timerJobId || !timerTaskId) return;
    startTimer({ jobId: timerJobId, taskId: timerTaskId, note: timerNote || undefined });
  };

  const handleStopTimer = async () => {
    if (!timer) return;
    await stopTimer();
    await loadTimerData();
  };

  const canStart = Boolean(timerJobId && timerTaskId);

  const quickTimerForm = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr,1fr,2fr,auto]">
        <div>
          <label className="text-xs uppercase text-ink-500">Job</label>
          <select
            value={timerJobId}
            onChange={(event) => setTimerJobId(event.target.value)}
            className="mt-2 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            {jobs.length === 0 && <option value="">No jobs yet</option>}
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase text-ink-500">Task</label>
          <select
            value={timerTaskId}
            onChange={(event) => setTimerTaskId(event.target.value)}
            className="mt-2 h-10 w-full rounded-xl border border-sand-200 bg-white/80 px-3 text-sm"
          >
            {tasks.length === 0 && <option value="">No tasks yet</option>}
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
          {!canStart && <p className="mt-2 text-xs text-ink-500">Select a job and task to start the timer.</p>}
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href="/app/tasks">Manage tasks</Link>
          </Button>
        </div>
        <div>
          <label className="text-xs uppercase text-ink-500">What are you working on?</label>
          <Input
            value={timerNote}
            onChange={(event) => setTimerNote(event.target.value)}
            placeholder="Add detail for the timesheet"
            className="mt-2"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button className="w-full md:w-auto" onClick={handleToggleTimer} disabled={!canStart}>
            {timer?.status === "running" ? "Pause" : timer?.status === "paused" ? "Resume" : "Start"}
          </Button>
          {timer && (
            <Button variant="outline" className="w-full md:w-auto" onClick={handleStopTimer}>
              Stop
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand-50 px-4 py-3">
        <div>
          <p className="text-xs uppercase text-ink-500">Status</p>
          <p className="text-sm font-semibold text-ink-700">
            {timer?.status === "running" ? "Running" : timer?.status === "paused" ? "Paused" : "Idle"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-ink-500">Elapsed</p>
          <p className="text-lg font-semibold">{formattedElapsed}</p>
        </div>
      </div>
    </div>
  );

   const summaryCards = summary ? (
     <div className="grid gap-4 md:grid-cols-3">
       <KpiCard metric={summary.overdueTasks} />
       <KpiCard metric={summary.revenueMonth} />
       <KpiCard metric={summary.utilization} />
     </div>
   ) : (
     <div className="grid gap-4 md:grid-cols-3">
       {Array.from({ length: 3 }).map((_, index) => (
         <Card key={index} className="h-40 animate-pulse bg-sand-100" />
       ))}
     </div>
   );

   return (
     <div className="space-y-8">
       <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Dashboard</h1>
          <p className="text-sm text-ink-700">Snapshot of pipeline, work in progress, and approvals.</p>
        </div>

         <div className="flex flex-wrap items-center gap-2">
           <Select value={range} onValueChange={setRange}>
             <SelectTrigger className="h-9 w-[160px] rounded-full bg-white/80">
               <SelectValue placeholder="Range" />
             </SelectTrigger>
             <SelectContent>
               {rangeOptions.map((option) => (
                 <SelectItem key={option.value} value={option.value}>
                   {option.label}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
           <Select value={team} onValueChange={setTeam}>
             <SelectTrigger className="h-9 w-[140px] rounded-full bg-white/80">
               <SelectValue placeholder="Team" />
             </SelectTrigger>
             <SelectContent>
               {teamOptions.map((option) => (
                 <SelectItem key={option.value} value={option.value}>
                   {option.label}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
           <Select value={owner} onValueChange={setOwner}>
             <SelectTrigger className="h-9 w-[120px] rounded-full bg-white/80">
               <SelectValue placeholder="Owner" />
             </SelectTrigger>
             <SelectContent>
               {ownerOptions.map((option) => (
                 <SelectItem key={option.value} value={option.value}>
                   {option.label}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-9 rounded-full">Quick timer</Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
              <div className="space-y-2">
                <DialogTitle>Quick timer</DialogTitle>
                <DialogDescription>Track work instantly</DialogDescription>
              </div>
              <div className="mt-4">{quickTimerForm}</div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

       {summaryCards}

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-white/60 bg-white/90 shadow-soft">
          <CardHeader className="space-y-2">
            <CardTitle>Pipeline snapshot</CardTitle>
            <CardDescription>Conversion health across lead stages</CardDescription>
          </CardHeader>
          <CardContent>
            {pipeline ? (
              <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="rounded-2xl bg-sand-50 p-4">
                  <p className="text-xs uppercase text-ink-500">Funnel</p>
                  <div className="mt-3">
                    <PipelineFunnel stages={pipeline.stages} />
                  </div>
                </div>
                <div className="rounded-2xl bg-sand-50 p-4">
                  <p className="text-xs uppercase text-ink-500">Performance</p>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-ink-500">Win rate</p>
                      <PipelineWinRateChart winRate={pipeline.winRate} />
                    </div>
                    <div>
                      <p className="text-xs uppercase text-ink-500">Timing</p>
                      <PipelineTimingChart
                        avgDaysToWin={pipeline.avgDaysToWin}
                        avgDaysInStage={pipeline.avgDaysInStage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-40 animate-pulse rounded-2xl bg-sand-100" />
            )}
          </CardContent>
        </Card>

         <div className="space-y-6">
           <Card className="border-white/60 bg-white/90 shadow-soft">
             <CardHeader>
               <CardTitle>Timesheet approvals</CardTitle>
               <CardDescription>Pending submissions</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               {!approvals || approvals.pending.length === 0 ? (
                 <div className="rounded-2xl bg-sand-50 p-5 text-sm text-ink-500">
                   No submissions awaiting approval.
                 </div>
               ) : (
                 <div className="space-y-3">
                   {approvals.pending.map((item) => (
                     <div
                       key={item.id}
                       className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-100 bg-sand-50 p-4 text-sm"
                     >
                       <div>
                         <p className="font-semibold text-ink-700">{item.person}</p>
                         <p className="text-xs text-ink-500">{item.period}</p>
                       </div>
                       <div className="text-xs text-ink-500">
                         {item.hours}h · {item.submittedAt}
                       </div>
                       <Button size="sm">Approve</Button>
                     </div>
                   ))}
                 </div>
               )}
               {approvals && (
                 <div>
                   <p className="text-xs uppercase text-ink-500">Approval aging</p>
                   <ApprovalAgingChart data={approvals.aging} />
                 </div>
               )}
             </CardContent>
           </Card>

             {attentionItems.length > 0 && (
               <Card className="border-white/60 bg-white/90 shadow-soft">
                 <CardHeader>
                   <CardTitle>Attention needed</CardTitle>
                   <CardDescription>Exceptions to resolve</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   {attentionItems.map((item) => (
                     <Link
                       key={item.label}
                       href={item.href}
                       className="flex items-center justify-between rounded-2xl border border-sand-100 bg-sand-50 px-4 py-3 text-sm text-ink-700 transition hover:bg-white"
                     >
                       <span>{item.label}</span>
                       <Badge variant="default">{item.count}</Badge>
                     </Link>
                   ))}
                 </CardContent>
               </Card>
             )}
         </div>
       </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-white/60 bg-white/90 shadow-soft">
            <CardHeader>
              <CardTitle>Quick timer</CardTitle>
              <CardDescription>Track work instantly</CardDescription>
            </CardHeader>
            <CardContent>{quickTimerForm}</CardContent>
          </Card>

          <Card className="border-white/60 bg-white/90 shadow-soft">
            <CardHeader>
              <CardTitle>Last 5 timers</CardTitle>
              <CardDescription>Recent time entries</CardDescription>
            </CardHeader>
            <CardContent>
              {lastTimers.length === 0 ? (
                <p className="text-sm text-ink-500">No timers yet.</p>
              ) : (
                <div className="space-y-2">
                  {lastTimers.map((timer) => (
                    <div
                      key={timer.id}
                      className="flex items-center justify-between rounded-2xl border border-sand-100 bg-sand-50 px-4 py-3 text-sm"
                    >
                      <span className="font-semibold text-ink-700">{timer.job}</span>
                      <span className="text-xs text-ink-500">{timer.duration}</span>
                      <span className="text-xs text-ink-500">{timer.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/60 bg-white/90 shadow-soft">
           <CardHeader>
             <CardTitle>Utilization</CardTitle>
             <CardDescription>Billable vs non-billable</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
             {utilization && (
               <div className="grid gap-6">
                 <div className="grid gap-3">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-ink-500">Overall utilization</span>
                     <span className="font-semibold">{utilization.utilizationPercent}%</span>
                   </div>
                   <UtilizationDonut
                     billable={utilization.billablePercent}
                     nonBillable={utilization.nonBillablePercent}
                   />
                 </div>
                 <div>
                   <p className="text-xs uppercase text-ink-500">Weekly trend</p>
                   <UtilizationTrend data={utilization.weeklyTrend} />
                 </div>
                 <div>
                   <p className="text-xs uppercase text-ink-500">Top staff</p>
                   <div className="mt-3 space-y-2">
                     {utilization.topStaff.map((staff) => (
                       <div key={staff.name} className="space-y-1 text-xs">
                         <div className="flex items-center justify-between">
                           <span className="text-ink-700">{staff.name}</span>
                           <span className="text-ink-500">{staff.percent}%</span>
                         </div>
                         <div className="h-2 rounded-full bg-sand-100">
                           <div
                             className="h-2 rounded-full bg-ocean-500"
                             style={{ width: `${staff.percent}%` }}
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             )}
             {!utilization && <div className="h-40 animate-pulse rounded-2xl bg-sand-100" />}
           </CardContent>
         </Card>
       </div>

       <Card className="border-white/60 bg-white/90 shadow-soft">
         <CardHeader className="flex flex-wrap items-center justify-between gap-3">
           <div>
             <CardTitle>Revenue trend</CardTitle>
             <CardDescription>Last 7/30 days performance</CardDescription>
           </div>
           <div className="flex flex-wrap items-center gap-2">
            <Select value={revenueRange} onValueChange={(value) => setRevenueRange(value as "7d" | "30d")}>
              <SelectTrigger className="h-9 w-[120px] rounded-full bg-white/80">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={revenueCategory} onValueChange={setRevenueCategory}>
              <SelectTrigger className="h-9 w-[160px] rounded-full bg-white/80">
                <SelectValue placeholder="Revenue by category" />
              </SelectTrigger>
               <SelectContent>
                 {(revenue?.categories ?? ["Service", "Client", "Job type"]).map((category) => (
                   <SelectItem key={category} value={category}>
                     {category}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <Button
               variant="ghost"
               className="h-9 rounded-full"
               onClick={() => setRevenueStacked((prev) => !prev)}
             >
               {revenueStacked ? "Stacked" : "Grouped"}
             </Button>
           </div>
         </CardHeader>
         <CardContent>
           {revenue ? (
             <RevenueChart data={revenue.trend} stacked={revenueStacked} />
           ) : (
             <div className="h-64 animate-pulse rounded-2xl bg-sand-100" />
           )}
         </CardContent>
       </Card>
     </div>
   );
 }
