 export type DeltaDirection = "up" | "down" | "flat";

 export type KpiSummary = {
   label: string;
   value: number;
   formattedValue: string;
   delta: number;
   deltaDirection: DeltaDirection;
   sparkline: number[];
 };

 export type DashboardSummary = {
   overdueTasks: KpiSummary;
   revenueMonth: KpiSummary;
   utilization: KpiSummary;
 };

 export type PipelineStage = {
   stage: string;
   count: number;
   conversionRate: number;
 };

 export type PipelineSnapshot = {
   stages: PipelineStage[];
   winRate: number;
   avgDaysToWin: number;
   avgDaysInStage: number;
 };

 export type ApprovalItem = {
   id: string;
   person: string;
   period: string;
   hours: number;
   submittedAt: string;
 };

 export type ApprovalAging = {
   bucket: string;
   count: number;
 };

 export type ApprovalsPayload = {
   pending: ApprovalItem[];
   aging: ApprovalAging[];
 };

 export type UtilizationPayload = {
   utilizationPercent: number;
   billablePercent: number;
   nonBillablePercent: number;
   weeklyTrend: { day: string; value: number }[];
   topStaff: { name: string; percent: number; billable: number }[];
 };

 export type RevenuePayload = {
   trend: { date: string; oneOff: number; recurring: number }[];
   categories: string[];
 };

 export type AttentionItem = {
   label: string;
   count: number;
   href: string;
 };
