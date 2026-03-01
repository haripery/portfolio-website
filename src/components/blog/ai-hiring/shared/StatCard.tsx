"use client";

import { AnimatedCounter } from "./AnimatedCounter";
import { ScrollReveal } from "./ScrollReveal";

export function StatCard({
  value,
  suffix = "",
  prefix = "",
  label,
  delay = 0,
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delay?: number;
  decimals?: number;
}) {
  return (
    <ScrollReveal delay={delay}>
      <div className="border border-ink/15 bg-card p-5 transition-colors hover:border-coral/40">
        <p
          className="text-3xl font-bold text-forest"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          <AnimatedCounter
            end={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        </p>
        <p className="mt-1 text-sm text-ink/60">{label}</p>
      </div>
    </ScrollReveal>
  );
}
