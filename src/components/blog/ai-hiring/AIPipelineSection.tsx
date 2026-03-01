"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Bot, Code, Video, User } from "lucide-react";
import { pipelineStages } from "./data/chartData";
import { SectionHeader } from "./shared/SectionHeader";
import { StatCard } from "./shared/StatCard";
import { ScrollReveal } from "./shared/ScrollReveal";
import { AnimatedCounter } from "./shared/AnimatedCounter";

const ICONS: Record<string, React.ElementType> = {
  FileText,
  Bot,
  Code,
  Video,
  User,
};

export function AIPipelineSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="py-16">
      <SectionHeader
        number="01"
        title="Every Stage of Hiring Now Runs Through AI"
        subtitle="The modern interview pipeline barely resembles what existed five years ago. AI has infiltrated every step, from the moment you click 'apply' to the final hiring decision."
        id="pipeline"
      />

      {/* Pipeline flow */}
      <ScrollReveal>
        <div className="mb-12 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-[640px]">
            {pipelineStages.map((stage, i) => {
              const Icon = ICONS[stage.icon];
              const isExpanded = expanded === stage.id;
              return (
                <div key={stage.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : stage.id)}
                    className={`relative flex-1 border p-4 transition-all cursor-pointer ${
                      isExpanded
                        ? "border-coral bg-coral/5"
                        : "border-ink/15 bg-card hover:border-coral/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-coral" />
                      <span className="text-xs font-medium text-forest truncate">
                        {stage.title}
                      </span>
                    </div>
                    <p
                      className="text-lg font-bold text-forest"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      {stage.aiPercent}%
                    </p>
                    <p className="text-[10px] text-ink/50">AI involvement</p>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden"
                        >
                          <p className="text-xs text-ink/60 leading-relaxed text-left">
                            {stage.detail}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  {i < pipelineStages.length - 1 && (
                    <div className="mx-1 text-ink/30 shrink-0">→</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Speed of Rejection */}
      <ScrollReveal>
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-ink/15 bg-card p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">Human Reviewer</p>
            <p
              className="text-4xl font-bold text-forest"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              <AnimatedCounter end={6} suffix=" min" />
            </p>
            <p className="text-sm text-ink/50 mt-1">per résumé</p>
          </div>
          <div className="border border-coral/30 bg-coral/5 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-coral mb-2">AI Screener</p>
            <p
              className="text-4xl font-bold text-coral"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              <AnimatedCounter end={0.3} suffix=" sec" decimals={1} />
            </p>
            <p className="text-sm text-ink/50 mt-1">per résumé</p>
          </div>
        </div>
        <p className="text-center text-sm text-ink/50 -mt-8 mb-12">
          In the time a human reviews 1 résumé, AI screens <strong className="text-forest">1,200</strong>
        </p>
      </ScrollReveal>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard value={82} suffix="%" label="Companies using AI for résumé screening" delay={0} />
        <StatCard value={75} suffix="%" label="Résumés rejected before human review" delay={0.1} />
        <StatCard value={95} suffix="%" label="AI parsing accuracy rate" delay={0.2} />
        <StatCard value={73} suffix="%" label="Orgs using chatbots for screening" delay={0.3} />
        <StatCard value={15} suffix="x" label="Faster AI evaluation vs human" delay={0.4} />
        <StatCard value={94} suffix="%" label="AI scoring consistency" delay={0.5} />
      </div>

      {/* Prose content */}
      <ScrollReveal>
        <div className="prose prose-site mt-10 max-w-none">
          <p>
            <strong>Résumé screening</strong> is almost entirely automated. ATS systems reject candidates in as little as 0.3 seconds. AI achieves 95% parsing accuracy and screens résumés 80% faster than manual review, but that speed comes at a cost: up to 75% of résumés are rejected before a human sees them. The AI looks for exact keyword matches, quantified achievements, and clean formatting — meaning a perfectly qualified candidate with a creative résumé layout can be eliminated instantly.
          </p>
          <p>
            <strong>Technical assessments</strong> have evolved dramatically. HackerRank&apos;s 2025 Developer Skills Report found that 97% of developers use AI tools, with 82% relying on AI coding assistants daily or weekly. In response, platforms now offer AI-assisted IDE environments during assessments — complete with built-in AI copilots — to mirror real-world development. The shift is away from pure algorithmic whiteboarding and toward evaluating how candidates collaborate with AI to solve practical problems.
          </p>
          <p>
            <strong>AI video interviews</strong> are the most visible change. HireVue alone completed nearly 20 million assessments in Q1 2024. These systems analyze verbal responses using large language models, evaluate communication clarity, and assign scores that rank candidates against each other.
          </p>
          <p>
            The efficiency gains are real but uneven. Organizations using AI report 85% time savings and 78% cost savings in hiring. Enterprise companies see average annual savings of $2.3 million. But here&apos;s the catch: SHRM&apos;s 2025 Benchmarking Survey revealed that average cost-per-hire and time-to-hire have actually <strong>both increased</strong> during the period of generative AI adoption. Why? Because AI created a doom loop.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
