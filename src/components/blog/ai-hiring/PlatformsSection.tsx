"use client";

import { useState } from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { platformData, unileverStats } from "./data/chartData";

export function PlatformsSection() {
  const [flipped, setFlipped] = useState<string | null>(null);

  return (
    <section className="py-16">
      <SectionHeader
        number="04"
        title="The Companies and Platforms Reshaping Hiring"
        subtitle="A handful of companies and AI platforms are defining how hiring works in 2026. Understanding which tools you'll encounter — and what they measure — is critical preparation."
        id="platforms"
      />

      {/* Platform Cards */}
      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platformData.map((platform, i) => {
          const isFlipped = flipped === platform.name;
          return (
            <ScrollReveal key={platform.name} delay={i * 0.08}>
              <button
                onClick={() => setFlipped(isFlipped ? null : platform.name)}
                className={`relative w-full text-left border p-5 transition-all min-h-[180px] cursor-pointer ${
                  isFlipped
                    ? "border-coral/40 bg-coral/5"
                    : "border-ink/15 bg-card hover:border-coral/30"
                }`}
              >
                {!isFlipped ? (
                  <>
                    <p
                      className="text-xs uppercase tracking-widest text-ink/40 mb-2"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      {platform.category}
                    </p>
                    <h5 className="text-lg font-bold text-forest mb-2">
                      {platform.name}
                    </h5>
                    <p
                      className="text-sm font-medium text-coral"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      {platform.metric}
                    </p>
                    <p className="mt-2 text-xs text-ink/40">Click for details →</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-coral mb-2">
                      {platform.name}
                    </p>
                    <p className="text-xs text-ink/60 mb-2">
                      <strong className="text-forest">Clients:</strong> {platform.clients}
                    </p>
                    <p className="text-xs text-ink/60 mb-2">
                      <strong className="text-forest">Measures:</strong> {platform.measures}
                    </p>
                    <p className="text-xs text-ink/60">
                      <strong className="text-forest">Prep:</strong> {platform.prep}
                    </p>
                  </>
                )}
              </button>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Prose: regulations */}
      <ScrollReveal>
        <div className="prose prose-site max-w-none my-8">
          <h3>Regulations Are Catching Up, but Unevenly</h3>
          <p>
            <strong>NYC Local Law 144</strong>, the first major U.S. regulation of AI hiring tools, requires annual bias audits and candidate notification. But a December 2025 audit found enforcement &ldquo;ineffective&rdquo; — 75% of complaints were misrouted and never reached the enforcing agency.
          </p>
          <p>
            The <strong>EU AI Act</strong> is the most consequential development globally. It classified all recruitment and hiring AI as high-risk, with core obligations becoming enforceable August 2, 2026. Prohibited practices that already took effect include emotion recognition in interviews and biometric categorization to infer protected traits. Fines reach up to €35 million or 7% of global turnover, and the law has extraterritorial reach — applying to U.S. companies evaluating EU-based candidates.
          </p>
          <p>
            In the U.S., existing federal anti-discrimination laws still apply. The <strong>Mobley v. Workday</strong> class action — where a Black applicant over 40 applied to 100+ positions through Workday&apos;s AI and was rejected every time — was preliminarily certified as a nationwide class in May 2025. States are filling the federal vacuum: Illinois HB 3773 (effective January 2026) prohibits discriminatory AI in hiring, Colorado&apos;s AI Act takes effect June 2026, and California finalized regulations in October 2025.
          </p>
        </div>
      </ScrollReveal>

      {/* Unilever Case Study */}
      <ScrollReveal>
        <div className="my-8 border border-mint/30 bg-mint/5 p-6 md:p-8">
          <h4
            className="mb-6 text-sm font-medium uppercase tracking-widest text-mint"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Case Study: Unilever AI Hiring Results
          </h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {unileverStats.map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-2xl font-bold text-forest"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-ink/60">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink/50">
            Stanford research found that candidates who passed AI-led interviews succeeded in subsequent human interviews at 53.12% — significantly higher than traditional résumé-screening methods.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
