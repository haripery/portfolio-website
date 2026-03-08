"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";

function DiagramNode({
  icon,
  label,
  sublabel,
  color = "border-[var(--ink)]/10",
}: {
  icon: string;
  label: string;
  sublabel: string;
  color?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-lg border ${color} bg-white dark:bg-[var(--ink)]/5 px-4 py-3 min-w-[100px] shadow-sm`}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className="text-[11px] font-semibold text-[var(--ink)]/80 text-center leading-tight">
        {label}
      </span>
      <span className="text-[9px] font-mono text-[var(--ink)]/35 text-center">
        {sublabel}
      </span>
    </div>
  );
}

function HorizontalArrow() {
  return (
    <div className="flex items-center">
      <div className="w-6 md:w-10 h-px bg-[var(--ink)]/20" />
      <div
        className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[var(--ink)]/20"
      />
    </div>
  );
}

function VerticalArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-mono text-[var(--ink)]/30 bg-[var(--ink)]/[0.04] px-2 py-0.5 rounded">
        {label}
      </span>
      <div className="h-5 w-px bg-[var(--ink)]/20" />
      <div
        className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[var(--ink)]/20"
      />
    </div>
  );
}

function VerticalArrowUp({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[var(--ink)]/20"
      />
      <div className="h-5 w-px bg-[var(--ink)]/20" />
      <span className="text-[9px] font-mono text-[var(--ink)]/30 bg-[var(--ink)]/[0.04] px-2 py-0.5 rounded">
        {label}
      </span>
    </div>
  );
}

function LayerLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <span className="text-[10px] font-mono text-[var(--ink)]/25 uppercase tracking-widest">
        {children}
      </span>
    </div>
  );
}

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

      {/* Visual Architecture Diagram */}
      <ScrollReveal delay={0.1}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-xl border border-[var(--ink)]/10 bg-[var(--ink)]/[0.02] p-5 md:p-8 mb-8"
        >
          {/* Browser Layer */}
          <LayerLabel>Browser</LayerLabel>
          <div className="rounded-lg border border-dashed border-[var(--ink)]/8 p-4 mb-3">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
              <DiagramNode icon="📊" label="Visitor Signals" sublabel="useVisitorSignals()" />
              <DiagramNode icon="🔍" label="Protocol Inspector" sublabel="AG-UI | A2A | A2UI" />
              <DiagramNode icon="🎨" label="Generated UI" sublabel="A2UI Components" />
            </div>
          </div>

          {/* Connection arrows */}
          <div className="flex items-start justify-center gap-12 md:gap-20 my-1">
            <VerticalArrow label="POST /api/visitor-intel" />
            <VerticalArrowUp label="SSE event stream" />
          </div>

          {/* Server Layer */}
          <LayerLabel>Server</LayerLabel>
          <div className="rounded-lg border border-dashed border-[var(--ink)]/8 p-4 mb-3">
            <div className="text-center mb-4">
              <span className="text-[10px] font-mono text-[var(--ink)]/40 border border-[var(--ink)]/8 px-3 py-1 rounded-full">
                Coordinator (orchestrator)
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              <DiagramNode
                icon="📡"
                label="Tracker Agent"
                sublabel="pure JS"
                color="border-emerald-300/50 dark:border-emerald-700/50"
              />
              <HorizontalArrow />
              <DiagramNode
                icon="🧠"
                label="Profiler Agent"
                sublabel="Anthropic + Zod"
                color="border-blue-300/50 dark:border-blue-700/50"
              />
              <HorizontalArrow />
              <DiagramNode
                icon="💡"
                label="Advisor Agent"
                sublabel="Anthropic + A2UI"
                color="border-purple-300/50 dark:border-purple-700/50"
              />
            </div>

            <div className="text-center mt-4">
              <span className="text-[9px] font-mono text-[var(--ink)]/25 bg-[var(--ink)]/[0.03] px-2 py-0.5 rounded">
                A2A Tasks + Messages
              </span>
            </div>
          </div>

          {/* Data Layer */}
          <LayerLabel>Data</LayerLabel>
          <div className="rounded-lg border border-dashed border-[var(--ink)]/8 px-4 py-3">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              <span className="text-[11px] font-mono text-[var(--ink)]/40">Prisma</span>
              <div className="w-4 h-px bg-[var(--ink)]/15" />
              <span className="text-[11px] font-mono text-[var(--ink)]/40">PostgreSQL</span>
              <span className="text-[var(--ink)]/8 mx-1">|</span>
              {["getProfile()", "getExperiences()", "getProjects()"].map((fn) => (
                <span
                  key={fn}
                  className="text-[9px] font-mono text-[var(--ink)]/25 bg-[var(--ink)]/[0.03] px-1.5 py-0.5 rounded"
                >
                  {fn}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </ScrollReveal>

      {/* Pipeline Steps + Protocol Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScrollReveal delay={0.15}>
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--ink)]">The Pipeline</h3>
            <ol className="space-y-3 text-sm text-[var(--ink)]/70">
              {[
                { n: 1, title: "Signals collected", desc: "referrer, device, pages viewed, scroll depth, UTM params" },
                { n: 2, title: "Tracker Agent", desc: "normalizes signals (A2A task: Coordinator > Tracker)" },
                { n: 3, title: "Profiler Agent", desc: "classifies persona via Claude (A2A task: Coordinator > Profiler)" },
                { n: 4, title: "Advisor Agent", desc: "streams recommendations with A2UI components (A2A task: Coordinator > Advisor)" },
              ].map(({ n, title, desc }) => (
                <li key={n} className="flex gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    {n}
                  </span>
                  <span>
                    <strong>{title}</strong> - {desc}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--ink)]">Protocol Usage</h3>
            <div className="space-y-3 text-sm">
              {[
                {
                  key: "AG-UI",
                  color: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20",
                  textColor: "text-emerald-600 dark:text-emerald-400",
                  desc: "Every event (tool calls, text streaming, state changes) flows through AG-UI SSE events from server to client.",
                },
                {
                  key: "A2A",
                  color: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20",
                  textColor: "text-blue-600 dark:text-blue-400",
                  desc: "Agents discover each other via Agent Cards. The Coordinator dispatches Tasks with Messages between them.",
                },
                {
                  key: "A2UI",
                  color: "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20",
                  textColor: "text-purple-600 dark:text-purple-400",
                  desc: "The Advisor Agent generates structured JSONL envelopes that render as rich React components.",
                },
              ].map(({ key, color, textColor, desc }) => (
                <div key={key} className={`p-3 rounded border ${color}`}>
                  <span className={`font-mono text-xs ${textColor}`}>{key}</span>
                  <p className="text-[var(--ink)]/60 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
