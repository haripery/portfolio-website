"use client";

import { salaryRangeData } from "../data/chartData";
import { ScrollReveal } from "../shared/ScrollReveal";

export function SalaryRangeChart() {
  const maxSalary = Math.max(...salaryRangeData.map((d) => d.max));
  const sorted = [...salaryRangeData].sort((a, b) => b.max - a.max);

  return (
    <ScrollReveal>
      <div className="my-8">
        <h4
          className="mb-4 text-sm font-medium uppercase tracking-widest text-ink/50"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          Salary Ranges ($K)
        </h4>
        <div className="space-y-3">
          {sorted.map((role) => {
            const leftPct = (role.min / maxSalary) * 100;
            const widthPct = ((role.max - role.min) / maxSalary) * 100;
            return (
              <div key={role.role} className="group">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm text-ink/70">{role.role}</span>
                  <span
                    className="text-xs text-ink/50"
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                  >
                    ${role.min}K – ${role.max}K
                  </span>
                </div>
                <div className="relative h-5 w-full bg-ink/5 rounded-sm">
                  <div
                    className="absolute top-0 h-full bg-coral/20 rounded-sm transition-all group-hover:bg-coral/30"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-coral/60 to-mint/60 rounded-sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}
