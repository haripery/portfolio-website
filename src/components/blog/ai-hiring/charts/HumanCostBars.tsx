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
import { humanCostData } from "../data/chartData";
import { ScrollReveal } from "../shared/ScrollReveal";

const COLORS = [
  "var(--coral)",
  "var(--coral)",
  "var(--gold)",
  "var(--gold)",
];

export function HumanCostBars() {
  return (
    <ScrollReveal>
      <div className="my-8">
        <h4
          className="mb-4 text-sm font-medium uppercase tracking-widest text-ink/50"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          The Human Cost
        </h4>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={humanCostData}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "var(--ink)", fillOpacity: 0.5 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={220}
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
                  const suffix = (props as unknown as { payload: { suffix: string } }).payload?.suffix ?? "";
                  return [`${value}${suffix}`, ""];
                }}
              />
              <Bar dataKey="value" radius={[0, 2, 2, 0]} animationDuration={1500}>
                {humanCostData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ScrollReveal>
  );
}
