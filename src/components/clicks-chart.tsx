"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyClicks } from "@/lib/stats";
import { shortDayLabel } from "@/lib/stats-format";

const tick = { fontSize: 12, fill: "currentColor" };

export function ClicksChart({ data }: { data: DailyClicks[] }) {
  const chartData = data.map((day) => ({
    ...day,
    label: shortDayLabel(day.day),
  }));

  return (
    // O gráfico é só visual. Os mesmos números estão na tabela logo abaixo dele.
    <div className="h-64 w-full text-zinc-900 dark:text-zinc-100" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        >
          <CartesianGrid vertical={false} strokeOpacity={0.15} />
          <XAxis
            dataKey="label"
            tick={tick}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            tick={tick}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ fill: "currentColor", fillOpacity: 0.08 }}
            formatter={(value) => [value, "Cliques"]}
            contentStyle={{
              background: "var(--background)",
              border: "1px solid #a1a1aa",
              borderRadius: 6,
            }}
          />
          <Bar
            dataKey="clicks"
            fill="currentColor"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
