"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import { applicationVolumeData } from "../data/chartData";
import { ScrollReveal } from "../shared/ScrollReveal";

export function ApplicationVolumeChart() {
  return (
    <ScrollReveal>
      <div className="my-8">
        <h4
          className="mb-4 text-sm font-medium uppercase tracking-widest text-ink/50"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          Applications Per Job Opening
        </h4>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={applicationVolumeData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="coralGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--coral)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--coral)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--ink)"
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: "var(--ink)", fillOpacity: 0.5 }}
                tickLine={false}
                axisLine={{ stroke: "var(--ink)", strokeOpacity: 0.15 }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--ink)", fillOpacity: 0.5 }}
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
              />
              <ReferenceLine x="2024 Q1" stroke="var(--coral)" strokeDasharray="4 4" strokeOpacity={0.6}>
                <Label
                  value="AI mass-apply tools go mainstream"
                  position="top"
                  fill="var(--coral)"
                  fontSize={11}
                />
              </ReferenceLine>
              <Area
                type="monotone"
                dataKey="appsPerJob"
                stroke="var(--coral)"
                strokeWidth={2}
                fill="url(#coralGradient)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ScrollReveal>
  );
}
