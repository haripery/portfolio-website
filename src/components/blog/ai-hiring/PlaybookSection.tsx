"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, FileText, Video, Users, Check, X } from "lucide-react";
import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";

const PILLARS = [
  {
    icon: Hammer,
    title: "Build",
    subtitle: "GitHub Portfolio > GPA",
    stat: "38% of eng leaders cite side projects as #1 signal",
    details: [
      "Pin your 6 best repositories with detailed READMEs",
      "Include purpose, tech stack, and screenshots",
      "Maintain a consistent contribution graph",
      "Contribute to open-source — even small documentation fixes prove collaboration",
      "87% of tech recruiters review GitHub profiles before the first interview",
    ],
  },
  {
    icon: FileText,
    title: "Optimize",
    subtitle: "ATS-Friendly Résumé",
    stat: "6 interviews per 100 tailored apps (vs <3 for generic)",
    details: [
      "Use .docx format with single-column layouts and standard fonts",
      "Extract exact keywords from job descriptions",
      "Include both long-form and acronym versions: 'Machine Learning (ML)'",
      "Quantify achievements with numbers",
      "10 carefully tailored applications outperform 100 spray-and-pray submissions",
    ],
  },
  {
    icon: Video,
    title: "Prepare",
    subtitle: "AI Video Interview Prep",
    stat: "STAR Method — 70% on Action portion",
    details: [
      "HireVue-style: 5–8 pre-recorded questions, 30s prep, up to 3 min per answer",
      "Look directly into the camera, not at your face on screen",
      "Keep answers under 60–90 seconds",
      "Practice by recording yourself and reviewing the footage",
      "AI evaluates communication clarity, structured reasoning, and quantified outcomes",
    ],
  },
  {
    icon: Users,
    title: "Connect",
    subtitle: "Network > Cold Apply",
    stat: "80% of jobs are never posted publicly",
    details: [
      "40% of job offers started with something other than an online application in 2025",
      "Recruiter-sourced candidates increased 72% since 2023",
      "Engage on LinkedIn, attend meetups and hackathons",
      "Contribute to open-source projects to build genuine connections",
      "Warm introductions yield 20%+ callback rates vs 2% cold application rates",
    ],
  },
];

const INTERVIEW_CHECKLIST = [
  { text: "Camera at eye level, look INTO lens", do: true },
  { text: "STAR method (70% on Action)", do: true },
  { text: "Answers under 90 seconds", do: true },
  { text: "Quantify achievements with numbers", do: true },
  { text: "Neutral, well-lit background", do: true },
  { text: "More energy than normal conversation", do: true },
  { text: "Don't over-script (AI detects robotic speech)", do: false },
  { text: "Don't keyword stuff without substance", do: false },
  { text: "Don't look at yourself on screen", do: false },
];

const CALCULATOR_APPROACHES = [
  {
    name: "Spray & Pray",
    apps: 100,
    callbackRate: 2,
    interviews: 2,
    hours: 100,
  },
  {
    name: "Targeted + Tailored",
    apps: 30,
    callbackRate: 6,
    interviews: 2,
    hours: 30,
  },
  {
    name: "Network + Targeted",
    apps: 15,
    callbackRate: 20,
    warmIntros: 15,
    interviews: 5,
    hours: 25,
  },
];

export function PlaybookSection() {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  return (
    <section className="py-16">
      <SectionHeader
        number="07"
        title="How to Actually Win in This Market"
        subtitle="The data points to a clear set of actionable strategies. Here's what works."
        id="playbook"
      />

      {/* 4 Pillar Cards */}
      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PILLARS.map((pillar, i) => {
          const Icon = pillar.icon;
          const isExpanded = expandedPillar === pillar.title;
          return (
            <ScrollReveal key={pillar.title} delay={i * 0.1}>
              <button
                onClick={() =>
                  setExpandedPillar(isExpanded ? null : pillar.title)
                }
                className={`w-full text-left border p-5 transition-all cursor-pointer ${
                  isExpanded
                    ? "border-coral/40 bg-coral/5"
                    : "border-ink/15 bg-card hover:border-coral/30"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-coral" />
                  <h5
                    className="text-lg font-bold text-forest"
                    style={{
                      fontFamily:
                        "var(--font-space-grotesk), system-ui, sans-serif",
                    }}
                  >
                    {pillar.title}
                  </h5>
                </div>
                <p className="text-sm text-ink/60 mb-1">{pillar.subtitle}</p>
                <p
                  className="text-xs text-coral"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                  }}
                >
                  {pillar.stat}
                </p>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2 overflow-hidden"
                    >
                      {pillar.details.map((detail, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-xs text-ink/60"
                        >
                          <span className="mt-0.5 text-coral">•</span>
                          {detail}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </button>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Application Strategy Calculator */}
      <ScrollReveal>
        <div className="my-8 border border-ink/15 bg-card p-6 md:p-8">
          <h4
            className="mb-6 text-sm font-medium uppercase tracking-widest text-ink/50"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Application Strategy Comparison
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {CALCULATOR_APPROACHES.map((approach) => (
              <div
                key={approach.name}
                className={`border p-4 ${
                  approach.name === "Network + Targeted"
                    ? "border-mint/40 bg-mint/5"
                    : "border-ink/15"
                }`}
              >
                <h5
                  className={`text-sm font-bold mb-3 ${
                    approach.name === "Network + Targeted"
                      ? "text-mint"
                      : "text-forest"
                  }`}
                >
                  {approach.name}
                  {approach.name === "Network + Targeted" && (
                    <span className="ml-2 text-[10px] border border-mint/40 px-1.5 py-0.5 text-mint uppercase tracking-wider">
                      Best
                    </span>
                  )}
                </h5>
                <div className="space-y-2 text-xs text-ink/60">
                  <div className="flex justify-between">
                    <span>Applications</span>
                    <span
                      className="text-forest"
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                      }}
                    >
                      {approach.apps}
                    </span>
                  </div>
                  {approach.warmIntros && (
                    <div className="flex justify-between">
                      <span>Warm intros</span>
                      <span
                        className="text-forest"
                        style={{
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                        }}
                      >
                        +{approach.warmIntros}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Callback rate</span>
                    <span
                      className="text-forest"
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                      }}
                    >
                      {approach.callbackRate}%
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-ink/10 pt-2">
                    <span className="font-medium text-forest">
                      Expected interviews
                    </span>
                    <span
                      className={`font-bold ${
                        approach.name === "Network + Targeted"
                          ? "text-mint"
                          : "text-forest"
                      }`}
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                      }}
                    >
                      ~{approach.interviews}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. hours invested</span>
                    <span
                      className="text-forest"
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                      }}
                    >
                      ~{approach.hours}h
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* AI Video Interview Checklist */}
      <ScrollReveal>
        <div className="my-8">
          <h4
            className="mb-4 text-sm font-medium uppercase tracking-widest text-ink/50"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            AI Video Interview Checklist
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {INTERVIEW_CHECKLIST.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border border-ink/10 px-3 py-2"
              >
                {item.do ? (
                  <Check className="h-4 w-4 shrink-0 text-mint" />
                ) : (
                  <X className="h-4 w-4 shrink-0 text-coral" />
                )}
                <span className="text-sm text-ink/70">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none my-8">
          <p>
            <strong>Demonstrate AI fluency, not just AI knowledge.</strong> The CodePath survey found that greater fluency with AI tools was the most common skill expectation for entry-level hires in 2026, followed by faster time to production-ready code and ability to learn new tools quickly. Build projects that integrate AI — a web app with an LLM-powered feature, an AI agent that automates a workflow, a fine-tuned model solving a real problem. Show employers you can work <em>with</em> AI as a force multiplier, not just <em>on</em> AI as an academic subject.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
