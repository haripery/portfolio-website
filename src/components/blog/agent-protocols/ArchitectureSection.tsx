"use client";

import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";

export function ArchitectureSection() {
  return (
    <section id="architecture" className="mb-16">
      <ScrollReveal>
        <span className="text-xs font-mono text-[var(--ink)]/30 tracking-wider uppercase">
          Under the Hood
        </span>
        <h2 className="text-2xl font-bold text-[var(--ink)] mt-1 mb-6">
          How It Works
        </h2>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--ink)]/[0.01] p-6 mb-6">
          <pre className="text-xs font-mono text-[var(--ink)]/60 leading-relaxed overflow-x-auto">
{`┌─────────────────────────────────────────────────────┐
│  Browser (Client)                                    │
│  ┌──────────────┐  ┌─────────────────────────────┐  │
│  │ Visitor       │  │ Protocol Inspector          │  │
│  │ Signals Hook  │  │ (AG-UI | A2A | A2UI tabs)   │  │
│  └──────┬───────┘  └──────────────▲──────────────┘  │
│         │ POST /api/visitor-intel  │ SSE events      │
│         ▼                          │                  │
├─────────┼──────────────────────────┼──────────────────┤
│  Server │                          │                  │
│  ┌──────▼──────────────────────────┼──────────────┐  │
│  │  Coordinator (orchestrator)     │              │  │
│  │  ┌──────────┐  ┌───────────┐  ┌▼───────────┐  │  │
│  │  │ Tracker  │→ │ Profiler  │→ │ Advisor    │  │  │
│  │  │ Agent    │  │ Agent     │  │ Agent      │  │  │
│  │  │ (pure JS)│  │ (Anthropic│  │ (Anthropic │  │  │
│  │  │          │  │  + Zod)   │  │  + A2UI)   │  │  │
│  │  └──────────┘  └───────────┘  └────────────┘  │  │
│  │       A2A Messages between agents              │  │
│  └────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Data Layer: Prisma → PostgreSQL                │ │
│  │  getProfile() getExperiences() getProjects()    │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScrollReveal delay={0.15}>
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--ink)]">The Pipeline</h3>
            <ol className="space-y-3 text-sm text-[var(--ink)]/70">
              <li className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                <span><strong>Signals collected</strong> — referrer, device, pages viewed, scroll depth, UTM params</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
                <span><strong>Tracker Agent</strong> normalizes signals (A2A task: Coordinator → Tracker)</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
                <span><strong>Profiler Agent</strong> classifies persona via Claude (A2A task: Coordinator → Profiler)</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">4</span>
                <span><strong>Advisor Agent</strong> streams recommendations with A2UI components (A2A task: Coordinator → Advisor)</span>
              </li>
            </ol>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--ink)]">Protocol Usage</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">AG-UI</span>
                <p className="text-[var(--ink)]/60 mt-1">
                  Every event (tool calls, text streaming, state changes) flows through AG-UI SSE events from server to client.
                </p>
              </div>
              <div className="p-3 rounded border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400">A2A</span>
                <p className="text-[var(--ink)]/60 mt-1">
                  Agents discover each other via Agent Cards. The Coordinator dispatches Tasks with Messages between them.
                </p>
              </div>
              <div className="p-3 rounded border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
                <span className="font-mono text-xs text-purple-600 dark:text-purple-400">A2UI</span>
                <p className="text-[var(--ink)]/60 mt-1">
                  The Advisor Agent generates structured JSONL envelopes that render as rich React components.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
