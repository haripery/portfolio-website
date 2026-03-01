"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { threeCamps } from "./data/chartData";

const COLOR_MAP = {
  mint: {
    border: "border-mint/30",
    label: "text-mint",
    bg: "bg-mint/5",
  },
  coral: {
    border: "border-coral/30",
    label: "text-coral",
    bg: "bg-coral/5",
  },
  gold: {
    border: "border-gold/30",
    label: "text-gold",
    bg: "bg-gold/5",
  },
} as const;

export function WhatThisMeansSection() {
  return (
    <section className="py-16">
      <SectionHeader
        title="What This Means for Engineers and CS Students"
        id="what-this-means"
      />

      <ScrollReveal>
        <div className="prose prose-site max-w-none mb-10">
          <p>
            The company landscape breaks into three distinct camps, and knowing which you&apos;re walking into changes how you prepare.
          </p>
        </div>
      </ScrollReveal>

      {/* Three camps comparison */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-10">
        {threeCamps.map((camp, i) => {
          const colors = COLOR_MAP[camp.color];
          return (
            <ScrollReveal key={camp.camp} delay={i * 0.12}>
              <div className={`border ${colors.border} ${colors.bg} p-6 h-full`}>
                <p
                  className={`text-xs uppercase tracking-widest mb-2 font-medium ${colors.label}`}
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  {camp.camp}
                </p>
                <h4
                  className="text-sm font-bold text-forest mb-1"
                  style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
                >
                  {camp.companies}
                </h4>

                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">What they test</p>
                  <p className="text-xs text-ink/60 leading-relaxed">{camp.whatTheyTest}</p>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">How to prepare</p>
                  <p className="text-xs text-ink/60 leading-relaxed">{camp.howToPrepare}</p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            The engineers who thrive won&apos;t master just one camp. They&apos;ll be the ones who can walk into any of these environments and adapt, building real projects with AI tools, maintaining deep fundamentals that work on a whiteboard, and developing the judgment to know when AI helps and when it doesn&apos;t.
          </p>
          <p>
            The interview is changing fast. But the core hasn&apos;t changed: prove you can think. The difference in 2026 is that thinking well now includes knowing when and how to think <em>with</em> AI, and when to think without it.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
