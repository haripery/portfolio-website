"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { skillsRadarData } from "../data/chartData";
import { ScrollReveal } from "../shared/ScrollReveal";

export function SkillsRadarChart() {
  return (
    <ScrollReveal>
      <div className="my-8">
        <h4
          className="mb-4 text-sm font-medium uppercase tracking-widest text-ink/50"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          Employer Demand vs. Average CS Graduate
        </h4>
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsRadarData}>
              <PolarGrid stroke="var(--ink)" strokeOpacity={0.15} />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 12, fill: "var(--ink)", fillOpacity: 0.7 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "var(--ink)", fillOpacity: 0.4 }}
              />
              <Radar
                name="What employers want"
                dataKey="employer"
                stroke="var(--coral)"
                fill="var(--coral)"
                fillOpacity={0.2}
                strokeWidth={2}
                animationDuration={1500}
              />
              <Radar
                name="Average CS graduate"
                dataKey="avgGrad"
                stroke="var(--mint)"
                fill="var(--mint)"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="4 4"
                animationDuration={1500}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "var(--ink)" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ScrollReveal>
  );
}
