 "use client";

 import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
   BarChart,
   Bar,
   CartesianGrid,
   XAxis,
   YAxis,
   Tooltip,
   LineChart,
   Line
 } from "recharts";
 import { PipelineStage, ApprovalAging, UtilizationPayload } from "../../../types/dashboard";

 const palette = ["#2b7cc2", "#5aa7e6", "#9bc7ee", "#c6ddf5", "#dbe8f7", "#f0f5fb"];
 const pipelineOrder = ["New", "Qualified", "Proposal", "Unassigned", "Lost", "Won"];

export function PipelineFunnel({ stages }: { stages: PipelineStage[] }) {
  const stageMap = new Map(stages.map((stage) => [stage.stage, stage.count]));
  const items = pipelineOrder.map((stage) => ({
    stage,
    count: stageMap.get(stage) ?? 0
  }));

  const viewWidth = 360;
  const viewHeight = 300;
  const topWidth = 320;
  const bottomWidth = 200;
  const segmentCount = items.length;
  const segmentHeight = viewHeight / segmentCount;
  const centerX = viewWidth / 2;

  const widthAt = (index: number) => {
    if (segmentCount === 1) return topWidth;
    const t = index / (segmentCount - 1);
    return topWidth + (bottomWidth - topWidth) * t;
  };

  return (
    <div className="h-72">
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="h-full w-full">
        {items.map((item, index) => {
          const yTop = index * segmentHeight;
          const yBottom = yTop + segmentHeight;
          const wTop = widthAt(index);
          const wBottom = widthAt(index + 1);
          const xTopLeft = centerX - wTop / 2;
          const xTopRight = centerX + wTop / 2;
          const xBottomLeft = centerX - wBottom / 2;
          const xBottomRight = centerX + wBottom / 2;
          const labelY = yTop + segmentHeight / 2 - 4;
          const valueY = yTop + segmentHeight / 2 + 12;

          return (
            <g key={item.stage}>
              <polygon
                points={`${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`}
                fill={palette[index % palette.length]}
                opacity={0.85}
              />
              <text
                x={centerX}
                y={labelY}
                textAnchor="middle"
                className="fill-slate-900 text-[11px] font-semibold"
              >
                {item.stage}
              </text>
              <text
                x={centerX}
                y={valueY}
                textAnchor="middle"
                className="fill-slate-900 text-[14px] font-semibold"
              >
                {item.count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function PipelineWinRateChart({ winRate }: { winRate: number }) {
  const data = [{ label: "Win rate", value: winRate }];
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip formatter={(value) => `${value ?? 0}%`} />
          <Bar dataKey="value" fill="#2b7cc2" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PipelineTimingChart({
  avgDaysToWin,
  avgDaysInStage
}: {
  avgDaysToWin: number;
  avgDaysInStage: number;
}) {
  const data = [
    { label: "Avg days to win", value: avgDaysToWin },
    { label: "Avg days in stage", value: avgDaysInStage }
  ];
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} fontSize={11} />
          <Tooltip formatter={(value) => `${value ?? 0}d`} />
          <Bar dataKey="value" fill="#5aa7e6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

 export function ApprovalAgingChart({ data }: { data: ApprovalAging[] }) {
   return (
     <div className="h-24">
       <ResponsiveContainer width="100%" height="100%">
         <BarChart data={data}>
           <Tooltip />
           <XAxis dataKey="bucket" tickLine={false} axisLine={false} fontSize={11} />
           <YAxis hide />
           <Bar dataKey="count" fill="#2b7cc2" radius={[8, 8, 0, 0]} />
         </BarChart>
       </ResponsiveContainer>
     </div>
   );
 }

 export function UtilizationDonut({
   billable,
   nonBillable
 }: {
   billable: number;
   nonBillable: number;
 }) {
   const data = [
     { name: "Billable", value: billable },
     { name: "Non-billable", value: nonBillable }
   ];

   return (
     <div className="h-48">
       <ResponsiveContainer width="100%" height="100%">
         <PieChart>
           <Tooltip formatter={(value) => `${value ?? 0}%`} />
           <Pie
             data={data}
             dataKey="value"
             innerRadius={52}
             outerRadius={80}
             paddingAngle={3}
           >
             {data.map((_, index) => (
               <Cell key={index} fill={palette[index]} />
             ))}
           </Pie>
         </PieChart>
       </ResponsiveContainer>
     </div>
   );
 }

 export function UtilizationTrend({ data }: { data: UtilizationPayload["weeklyTrend"] }) {
   return (
     <div className="h-24">
       <ResponsiveContainer width="100%" height="100%">
         <LineChart data={data}>
           <Tooltip formatter={(value) => `${value ?? 0}%`} />
           <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
           <YAxis hide />
           <Line type="monotone" dataKey="value" stroke="#1f5f96" strokeWidth={2} />
         </LineChart>
       </ResponsiveContainer>
     </div>
   );
 }

 export function RevenueChart({
   data,
   stacked
 }: {
   data: { date: string; oneOff: number; recurring: number }[];
   stacked: boolean;
 }) {
   return (
     <div className="h-64">
       <ResponsiveContainer width="100%" height="100%">
         <BarChart data={data}>
           <CartesianGrid strokeDasharray="3 3" vertical={false} />
           <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
           <YAxis tickLine={false} axisLine={false} fontSize={11} />
           <Tooltip
             formatter={(value) => {
               const numberValue = typeof value === "number" ? value : Number(value ?? 0);
               return `NZ$ ${numberValue.toLocaleString()}`;
             }}
           />
           <Bar dataKey="oneOff" stackId={stacked ? "a" : undefined} fill="#2b7cc2" radius={[6, 6, 0, 0]} />
           <Bar dataKey="recurring" stackId={stacked ? "a" : undefined} fill="#9bc7ee" radius={[6, 6, 0, 0]} />
         </BarChart>
       </ResponsiveContainer>
     </div>
   );
 }
