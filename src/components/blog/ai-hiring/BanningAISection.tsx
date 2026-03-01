"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { banningCompanies } from "./data/chartData";
import { StatCard } from "./shared/StatCard";

export function BanningAISection() {
  return (
    <section className="py-16">
      <SectionHeader
        title="The Other Side: Companies Banning AI"
        id="banning-ai"
      />

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            While Canva, Shopify, and Mercor embrace AI in interviews, the biggest tech companies are moving in the opposite direction.
          </p>
        </div>
      </ScrollReveal>

      {/* Company cards */}
      <ScrollReveal>
        <div className="my-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {banningCompanies.map((company, i) => (
            <div
              key={company.name}
              className="border border-ink/15 p-5 hover:border-coral/30 transition-colors"
            >
              <h4
                className="text-base font-bold text-forest mb-2"
                style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
              >
                {company.name}
              </h4>
              <p className="text-xs text-ink/60 leading-relaxed">{company.action}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Key stat */}
      <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard value={81} suffix="%" label="of Big Tech interviewers suspected candidates of using AI to cheat" />
        <StatCard value={31} suffix="%" label="definitively caught someone cheating" delay={0.1} />
      </div>

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            The reason is straightforward. Research from interviewing.io surveying 63 interviewers across Big Tech found that 81% had suspected candidates of using AI to cheat during remote interviews, and 31% had definitively caught someone [23]. Meta has made cheating prevention &ldquo;front-and-center&rdquo; as a company-wide priority [23].
          </p>
          <p>
            The Big Tech vs. startup split is becoming a defining feature of 2026 hiring. Interviewing.io&apos;s research found that Big Tech is doubling down on harder algorithmic questions to outpace AI capabilities, while startups are increasingly incorporating AI tools as part of the interview itself, viewing AI fluency as a core job skill rather than a form of cheating [23].
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
