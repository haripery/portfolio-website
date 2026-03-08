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

const SKILLS = [
  {
    label: "Generative UI",
    detail: "A2UI, Vercel AI SDK",
  },
  {
    label: "AI Evaluation",
    detail: "Non-deterministic testing",
  },
  {
    label: "Protocol Fluency",
    detail: "MCP, AG-UI, A2A",
  },
  {
    label: "Human-in-the-Loop",
    detail: "Approval & feedback patterns",
  },
  {
    label: "Streaming Architecture",
    detail: "SSE, chunked responses",
  },
  {
    label: "Context Engineering",
    detail: "Structured LLM input design",
  },
];

export function CareerImpactSection() {
  return (
    <section id="career-impact" className="mb-16">
      <ScrollReveal>
        <span className="text-xs font-mono text-ink/30 tracking-wider uppercase">
          For Engineers
        </span>
        <h2 className="text-2xl font-bold text-ink mt-1 mb-6">
          What This Means for Your Career
        </h2>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="max-w-2xl mb-8">
          <p className="text-sm text-ink/60 leading-relaxed mb-4">
            Frontend engineering is becoming orchestration engineering. AI
            rapidly produces 70% of the code — the scaffolding, the obvious
            patterns — but the remaining 30% involving architecture, edge cases,
            and integration is where engineers differentiate.
            <Cite n={11} />
            {" "}The Thoughtworks Technology Radar documented this as the shift
            from &ldquo;vibe coding&rdquo; to context engineering — the
            systematic practice of structuring information for reliable AI
            output.
            <Cite n={12} />
          </p>
          <p className="text-sm text-ink/60 leading-relaxed mb-4">
            Frontend-only job posts dropped 25% in 2024-2025
            <Cite n={9} />, but full-stack and AI-focused roles are rising.
            Engineers who understand agent protocols — how to wire agents to
            frontends, build generative UI, and design human-in-the-loop
            workflows — have a concrete differentiator.
          </p>
          <p className="text-sm text-ink/60 leading-relaxed">
            The contrarian case: frontend may actually be{" "}
            <em>less</em> vulnerable to AI automation than backend. Visual,
            interactive, accessibility-sensitive work remains stubbornly hard to
            automate — and if developer productivity rises, companies may hire
            more engineers, not fewer.
            <Cite n={13} />
          </p>
        </div>
      </ScrollReveal>

      {/* Skills Grid */}
      <ScrollReveal delay={0.2}>
        <p className="text-[10px] font-mono text-ink/25 uppercase tracking-widest mb-3">
          Key Skills to Develop
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SKILLS.map((skill, i) => (
            <motion.div
              key={skill.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-lg border border-ink/15 bg-ink/[0.04] p-3"
            >
              <span className="text-sm font-semibold text-ink">
                {skill.label}
              </span>
              <p className="text-[10px] font-mono text-ink/35 mt-1">
                {skill.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
