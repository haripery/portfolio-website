"use client";

import { entryLevelSqueezeData } from "../data/chartData";
import { ScrollReveal } from "../shared/ScrollReveal";
import { AnimatedCounter } from "../shared/AnimatedCounter";

export function EntryLevelSqueezeChart() {
  const maxAbs = Math.max(...entryLevelSqueezeData.map((d) => Math.abs(d.change)));

  return (
    <ScrollReveal>
      <div className="my-8">
        <h4
          className="mb-4 text-sm font-medium uppercase tracking-widest text-ink/50"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          The Entry-Level Squeeze (% Change)
        </h4>
        <div className="space-y-4">
          {entryLevelSqueezeData.map((item) => {
            const isNegative = item.change < 0;
            const widthPct = (Math.abs(item.change) / maxAbs) * 100;
            return (
              <div key={item.label}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm text-ink/70">{item.label}</span>
                  <span
                    className={`text-sm font-medium ${isNegative ? "text-coral" : "text-mint"}`}
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                  >
                    <AnimatedCounter
                      end={item.change}
                      prefix={item.change > 0 ? "+" : ""}
                      suffix="%"
                      decimals={1}
                    />
                  </span>
                </div>
                <div className="relative h-4 w-full">
                  <div className="absolute left-1/2 top-0 h-full w-px bg-ink/20" />
                  {isNegative ? (
                    <div
                      className="absolute top-0 right-1/2 h-full bg-coral/30 rounded-l-sm"
                      style={{ width: `${widthPct / 2}%` }}
                    >
                      <div className="absolute inset-0 bg-coral/50 rounded-l-sm" />
                    </div>
                  ) : (
                    <div
                      className="absolute top-0 left-1/2 h-full bg-mint/30 rounded-r-sm"
                      style={{ width: `${widthPct / 2}%` }}
                    >
                      <div className="absolute inset-0 bg-mint/50 rounded-r-sm" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-center text-xs text-ink/40 mt-2">
            ← Declining · Growing →
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}
