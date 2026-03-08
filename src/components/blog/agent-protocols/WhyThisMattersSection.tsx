"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";

function Cite({ n }: { n: number }) {
  return (
    <sup className="text-[10px] text-blue-500 dark:text-blue-400 ml-0.5">
      <a href="#sources" className="hover:underline">
        [{n}]
      </a>
    </sup>
  );
}

const STACK_LAYERS = [
  {
    number: 4,
    protocol: "A2UI",
    label: "Presentation",
    description: "What the user sees: agents generate rich, interactive UI",
    border: "border-purple-200 dark:border-purple-800/50",
    bg: "bg-purple-50/50 dark:bg-purple-950/20",
    text: "text-purple-700 dark:text-purple-300",
  },
  {
    number: 3,
    protocol: "AG-UI",
    label: "Transport",
    description: "How agents stream events to frontends in real-time",
    border: "border-emerald-200 dark:border-emerald-800/50",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  {
    number: 2,
    protocol: "A2A",
    label: "Coordination",
    description: "How agents discover and delegate tasks to each other",
    border: "border-blue-200 dark:border-blue-800/50",
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    number: 1,
    protocol: "MCP",
    label: "Foundation",
    description: "How agents access tools, data, and external services",
    border: "border-amber-200 dark:border-amber-800/50",
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300",
  },
];

export function WhyThisMattersSection() {
  return (
    <section id="why-this-matters" className="mb-16">
      <ScrollReveal>
        <span className="text-xs font-mono text-ink/30 tracking-wider uppercase">
          The Bigger Picture
        </span>
        <h2 className="text-2xl font-bold text-ink mt-1 mb-6">
          Why This Matters
        </h2>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="max-w-2xl mb-8">
          <p className="text-sm text-ink/60 leading-relaxed mb-4">
            AI agents are everywhere: coding assistants, workflow automators,
            customer support bots, but there has been no standard way for them
            to communicate with frontends, tools, or each other. Every team
            builds bespoke integrations, and every integration breaks when the
            agent changes.
            <Cite n={6} />
          </p>
          <p className="text-sm text-ink/60 leading-relaxed mb-4">
            The industry is converging on a clear pattern: AI generates the
            first draft, traditional UI handles refinement. A CHI 2024 study
            found that combining direct manipulation with LLM capabilities made
            users 50% faster with 25% higher task success compared to chat-only
            interaction.
            <Cite n={10} />
          </p>
          <p className="text-sm text-ink/60 leading-relaxed">
            Three protocols emerged in 2024-2025 to standardize this. Together
            with MCP, they form a complete stack, from how agents access tools
            to how they render interactive UI in the browser. Think of it as the
            HTTP/TCP/IP of the agent era.
          </p>
        </div>
      </ScrollReveal>

      {/* Protocol Stack Diagram */}
      <ScrollReveal delay={0.2}>
        <div className="rounded-xl border border-ink/15 bg-ink/[0.04] p-4 sm:p-6 md:p-8">
          <p className="text-[10px] font-mono text-ink/25 uppercase tracking-widest mb-4">
            The Agent Protocol Stack
          </p>
          <div className="space-y-2">
            {STACK_LAYERS.map((layer, i) => (
              <motion.div
                key={layer.protocol}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                className={`flex items-center gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 ${layer.border} ${layer.bg}`}
              >
                <span className="text-[10px] font-mono text-ink/25 shrink-0 w-4 text-right">
                  {layer.number}
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-bold ${layer.text}`}>
                      {layer.protocol}
                    </span>
                    <span className="text-[10px] font-mono text-ink/30">
                      {layer.label}
                    </span>
                  </div>
                  <span className="text-xs text-ink/40 truncate hidden sm:inline">
                    {layer.description}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
