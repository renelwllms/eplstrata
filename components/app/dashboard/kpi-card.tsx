 "use client";

 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
 import { Sparkline } from "./sparkline";
 import { KpiSummary } from "../../../types/dashboard";
 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

 export function KpiCard({ metric }: { metric: KpiSummary }) {
   const isUp = metric.deltaDirection === "up";
   const isDown = metric.deltaDirection === "down";
   const arrow = isUp ? "▲" : isDown ? "▼" : "●";
   const deltaColor = isUp ? "text-emerald-700" : isDown ? "text-rose-700" : "text-ink-500";
  const sparkColor = "#1d4ed8";

   return (
     <Card className="border-white/60 bg-white/90 shadow-soft">
       <CardHeader>
         <CardTitle>{metric.label}</CardTitle>
         <CardDescription>Updated today</CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="flex items-center justify-between">
           <p className="text-3xl font-semibold">{metric.formattedValue}</p>
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <span className={`text-xs font-semibold ${deltaColor}`}>
                   {arrow} {Math.abs(metric.delta)}%
                 </span>
               </TooltipTrigger>
               <TooltipContent>
                 {isUp ? "Up" : isDown ? "Down" : "Flat"} vs previous period
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>
         </div>
         <Sparkline data={metric.sparkline} color={sparkColor} />
       </CardContent>
     </Card>
   );
 }
