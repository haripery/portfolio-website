"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { roleGrowthData } from "../data/chartData";
import { ScrollReveal } from "../shared/ScrollReveal";

const COLORS = [
  "var(--coral)",
  "var(--gold)",
  "var(--mint)",
  "var(--coral)",
  "var(--gold)",
];

export function RoleGrowthChart() {
  return (
    <ScrollReveal>
      <div className="my-8">
        <h4
          className="mb-4 text-sm font-medium uppercase tracking-widest text-ink/50"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          YoY Job Posting Growth by Role
        </h4>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={roleGrowthData}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--ink)", fillOpacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="role"
                width={160}
                tick={{ fontSize: 12, fill: "var(--ink)", fillOpacity: 0.7 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--ink)",
                  borderRadius: "2px",
                  fontSize: 12,
                  color: "var(--forest)",
                }}
                formatter={(value, _name, props) => {
                  const salaryRange = (props as unknown as { payload: { salaryRange: string } }).payload?.salaryRange ?? "";
                  return [`${value}% growth · ${salaryRange}`, ""];
                }}
              />
              <Bar dataKey="growth" radius={[0, 2, 2, 0]} animationDuration={1500}>
                {roleGrowthData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ScrollReveal>
  );
}
