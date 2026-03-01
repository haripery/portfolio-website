"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { SkillsRadarChart } from "./charts/SkillsRadarChart";
import { AnimatedCounter } from "./shared/AnimatedCounter";

const SKILL_GROUPS = [
  {
    level: "Hot",
    color: "text-coral border-coral/30 bg-coral/10",
    skills: [
      "Python (18% of postings)",
      "RAG",
      "LangChain",
      "Prompt Engineering",
    ],
  },
  {
    level: "Warm",
    color: "text-gold border-gold/30 bg-gold/10",
    skills: ["AWS (14%)", "SQL", "System Design", "Fine-tuning"],
  },
  {
    level: "Rising",
    color: "text-mint border-mint/30 bg-mint/10",
    skills: ["AI Ethics", "Agentic AI", "Human-AI Interaction"],
  },
  {
    level: "Essential Soft",
    color: "text-forest border-ink/20 bg-ink/5",
    skills: ["Communication", "Professionalism", "Resilience", "Accountability"],
  },
];

const CERTS = [
  { name: "AWS Solutions Architect", detail: "45K+ openings, gold standard cloud cert" },
  { name: "AWS AI Practitioner", detail: "New 2025, GenAI entry point" },
  { name: "Google Cloud Pro Architect", detail: "$200K avg salary for holders" },
  { name: "DeepLearning.AI Specializations", detail: "Strong AI/ML foundation on Coursera" },
  { name: "Google AI Essentials", detail: "Accessible entry point for AI literacy" },
];

export function SkillsSection() {
  return (
    <section className="py-16">
      <SectionHeader
        number="06"
        title="The Skills That Actually Get You Hired in 2026"
        subtitle="The data on what employers want is clear — and it defies some common assumptions."
        id="skills"
      />

      <SkillsRadarChart />

      {/* Salary Premium */}
      <ScrollReveal>
        <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-ink/15 bg-card p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">With AI Skills</p>
            <p
              className="text-4xl font-bold text-mint"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              +<AnimatedCounter end={28} suffix="%" />
            </p>
            <p className="text-sm text-ink/50 mt-1">salary premium</p>
          </div>
          <div className="border border-mint/30 bg-mint/5 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-mint mb-2">Multiple AI Skills</p>
            <p
              className="text-4xl font-bold text-mint"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              +<AnimatedCounter end={43} suffix="%" />
            </p>
            <p className="text-sm text-ink/50 mt-1">salary premium</p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none my-8">
          <p>
            <strong>Technical skills dominate job postings but AI literacy is the fastest-growing requirement.</strong> Python appears in 18% of all tech job postings, followed by AWS (14%), SQL, and analysis skills (21%). But the biggest shift is AI-specific: 53% of U.S. tech postings now require AI or ML skills, up from 29% a year earlier. Roles requiring at least one AI/generative AI skill offer an average of $18,000 more in annual compensation.
          </p>
          <p>
            <strong>Soft skills aren&apos;t secondary — they&apos;re equally valued.</strong> A ResumeTemplates survey found 62% of hiring managers say soft skills and hard skills are equally valuable, with another 24% saying soft skills matter more. LinkedIn data shows 92% of hiring managers consider soft skills equally or more important than technical skills. A landmark Harvard Business Review study analyzing 1,000+ occupations and 70 million job transitions found that workers with broad foundational skills — reading comprehension, mathematical reasoning, collaboration — learned faster, earned more, and proved more resilient than those with narrow specialized skills like coding alone.
          </p>
        </div>
      </ScrollReveal>

      {/* Skills Grid */}
      <ScrollReveal>
        <div className="my-8">
          <h4
            className="mb-4 text-sm font-medium uppercase tracking-widest text-ink/50"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Skills by Demand Level
          </h4>
          <div className="space-y-4">
            {SKILL_GROUPS.map((group) => (
              <div key={group.level}>
                <span
                  className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-wider mb-2 ${group.color}`}
                >
                  {group.level}
                </span>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="border border-ink/15 px-3 py-1.5 text-sm text-ink/70 transition-colors hover:border-coral/40 hover:text-forest"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Certifications */}
      <ScrollReveal>
        <div className="my-8">
          <h4
            className="mb-4 text-sm font-medium uppercase tracking-widest text-ink/50"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Certifications Worth Pursuing
          </h4>
          <div className="space-y-2">
            {CERTS.map((cert) => (
              <div
                key={cert.name}
                className="flex items-baseline justify-between border-b border-ink/10 pb-2"
              >
                <span className="text-sm font-medium text-forest">{cert.name}</span>
                <span className="text-xs text-ink/50 ml-4 text-right">{cert.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
