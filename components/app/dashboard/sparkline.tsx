"use client";

import { ResponsiveContainer, BarChart, Bar, Tooltip, XAxis, Line } from "recharts";

const buildTicks = (length: number) => {
  if (length >= 30) return [1, 15, 30].filter((tick) => tick <= length);
  if (length >= 15) return [1, Math.round(length / 2), length].filter((tick) => tick <= length);
  return [1, length].filter((tick) => tick <= length);
};

export function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((value, index) => ({ day: index + 1, value }));
  const ticks = buildTicks(chartData.length);
  const gradientId = "kpi-bar-gradient";
  const lineGradientId = "kpi-line-gradient";

  return (
    <div className="h-16">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 6, right: 0, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.95} />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.65} />
            </linearGradient>
            <linearGradient id={lineGradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <Tooltip cursor={false} formatter={(value) => (value ?? 0).toString()} />
          <XAxis
            dataKey="day"
            ticks={ticks}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#7a8a9e" }}
            height={12}
          />
          <Bar dataKey="value" fill={`url(#${gradientId})`} radius={[6, 6, 2, 2]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={`url(#${lineGradientId})`}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
