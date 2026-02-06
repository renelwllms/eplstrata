"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { leadStagePalette } from "./lead-stage-palette";

type StageSlice = {
  name: string;
  value: number;
};

export function LeadStagePie({ data }: { data: StageSlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="h-56 w-full min-w-[240px]">
      {total === 0 ? (
        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-sand-200 text-sm text-ink-500">
          No leads yet.
        </div>
      ) : (
        <ResponsiveContainer width="99%" height="100%">
          <PieChart>
            <Tooltip formatter={(value, name) => [`${value ?? 0}`, name as string]} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
              {data.map((_, index) => (
                <Cell key={index} fill={leadStagePalette[index % leadStagePalette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
