"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";

const TAKEAWAYS = [
  {
    title: "The 'just code' era is ending",
    stat: "Programmer jobs −27.5%, Developer jobs −0.3%",
    description:
      "U.S. programmer employment dropped 27.5% while software developer employment held steady, signaling a decisive shift from writing code to designing systems, orchestrating AI tools, and solving problems that require human judgment.",
    accent: "coral",
  },
  {
    title: "Human skills → more valuable",
    stat: "92% of managers say soft skills equally/more important",
    description:
      "As AI handles routine screening, the signals that differentiate candidates are portfolios showing real work, networks providing warm introductions, and communication skills that no chatbot can fake.",
    accent: "mint",
  },
  {
    title: "New career paths are emerging",
    stat: "170M new jobs by 2030 (WEF)",
    description:
      "The regulatory and ethical dimensions of AI in hiring are creating entirely new career paths — from AI auditors to ethics officers to compliance specialists — representing opportunity for students willing to work at the intersection of technology and policy.",
    accent: "gold",
  },
];

export function ConclusionSection() {
  return (
    <section className="py-16">
      <SectionHeader
        number="08"
        title="The Market Rewards Adaptation"
        subtitle="The hiring landscape of 2026 is paradoxical. AI has made applying easier and screening faster, yet both cost-per-hire and time-to-hire have increased."
        id="conclusion"
      />

      {/* Three Takeaway Cards */}
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {TAKEAWAYS.map((item, i) => (
          <ScrollReveal key={item.title} delay={i * 0.15}>
            <div
              className={`border p-6 h-full ${
                item.accent === "coral"
                  ? "border-coral/30"
                  : item.accent === "mint"
                  ? "border-mint/30"
                  : "border-gold/30"
              }`}
            >
              <p
                className={`text-xs font-medium uppercase tracking-widest mb-2 ${
                  item.accent === "coral"
                    ? "text-coral"
                    : item.accent === "mint"
                    ? "text-mint"
                    : "text-gold"
                }`}
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {item.stat}
              </p>
              <h4
                className="text-lg font-bold text-forest mb-3"
                style={{
                  fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
                }}
              >
                {item.title}
              </h4>
              <p className="text-sm text-ink/60 leading-relaxed">
                {item.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            The students who thrive won&apos;t be those who resist AI or those who blindly rely on it. They&apos;ll be the ones who understand how it works on both sides of the hiring table and position themselves accordingly — with tailored applications that speak to algorithms <em>and</em> humans, portfolios that demonstrate real capability, networks that bypass the noise, and the adaptive intelligence to keep learning as the landscape continues to shift.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
