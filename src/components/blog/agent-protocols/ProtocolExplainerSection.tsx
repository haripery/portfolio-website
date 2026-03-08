"use client";

import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";
import { AGENT_CARDS_DISPLAY } from "./data/agentCards";
import { PROTOCOL_DESCRIPTIONS } from "./data/protocolEventTypes";

const PROTOCOL_COLORS: Record<string, string> = {
  "AG-UI": "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20",
  "A2A": "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20",
  "A2UI": "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20",
};

const PROTOCOL_TEXT_COLORS: Record<string, string> = {
  "AG-UI": "text-emerald-700 dark:text-emerald-300",
  "A2A": "text-blue-700 dark:text-blue-300",
  "A2UI": "text-purple-700 dark:text-purple-300",
};

export function ProtocolExplainerSection() {
  return (
    <section id="protocols" className="mb-16">
      <ScrollReveal>
        <span className="text-xs font-mono text-[var(--ink)]/30 tracking-wider uppercase">
          The Protocol Stack
        </span>
        <h2 className="text-2xl font-bold text-[var(--ink)] mt-1 mb-6">
          Three Protocols, One Pipeline
        </h2>
      </ScrollReveal>

      {/* Protocol cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {(Object.entries(PROTOCOL_DESCRIPTIONS) as [string, typeof PROTOCOL_DESCRIPTIONS["AG-UI"]][]).map(
          ([key, proto], i) => (
            <ScrollReveal key={key} delay={i * 0.1}>
              <div
                className={`rounded-lg border p-5 h-full ${PROTOCOL_COLORS[key]}`}
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className={`font-bold text-lg ${PROTOCOL_TEXT_COLORS[key]}`}>
                    {key}
                  </h3>
                  <span className="text-[10px] text-[var(--ink)]/30">
                    by {proto.creator}
                  </span>
                </div>
                <p className="text-xs font-mono text-[var(--ink)]/40 mb-2">
                  {proto.name}
                </p>
                <p className="text-sm text-[var(--ink)]/60 leading-relaxed">
                  {proto.description}
                </p>
              </div>
            </ScrollReveal>
          )
        )}
      </div>

      {/* Agent Cards */}
      <ScrollReveal>
        <h3 className="text-lg font-bold text-[var(--ink)] mb-4">
          Agent Cards (A2A Discovery)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AGENT_CARDS_DISPLAY.map((card) => (
            <div
              key={card.name}
              className="rounded-lg border border-[var(--ink)]/10 bg-[var(--ink)]/[0.02] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{card.icon}</span>
                <h4 className="font-semibold text-sm text-[var(--ink)]">{card.name}</h4>
              </div>
              <p className="text-xs text-[var(--ink)]/50 mb-2">{card.description}</p>
              <div className="flex flex-wrap gap-1">
                {card.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--ink)]/5 text-[var(--ink)]/40 font-mono"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
