"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { threatData, companyTimelineData } from "./data/chartData";

const TYPE_COLORS: Record<string, string> = {
  ban: "border-coral text-coral",
  analog: "border-gold text-gold",
  enforcement: "border-coral text-coral",
  standard: "border-mint text-mint",
};

const TYPE_LABELS: Record<string, string> = {
  ban: "Ban",
  analog: "Analog Return",
  enforcement: "Enforcement",
  standard: "New Standard",
};

export function TrustCrisisSection() {
  return (
    <section className="py-16">
      <SectionHeader
        number="03"
        title="Deepfakes, Cheating Tools, and a Trust Crisis"
        subtitle="Beyond the arms race in applications, a more alarming development is unfolding: AI-powered interview fraud has become a genuine national security concern."
        id="trust-crisis"
      />

      {/* Threat Dashboard */}
      <ScrollReveal>
        <div className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {threatData.map((item, i) => (
            <div
              key={i}
              className={`relative overflow-hidden border p-5 transition-colors ${
                item.color === "coral"
                  ? "border-coral/30 hover:border-coral/50"
                  : "border-gold/30 hover:border-gold/50"
              }`}
            >
              <p
                className={`text-2xl font-bold ${
                  item.color === "coral" ? "text-coral" : "text-gold"
                }`}
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {item.value}
              </p>
              <p className="mt-1 text-xs text-ink/60">{item.label}</p>
              {/* Subtle scan line */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--ink) 2px, var(--ink) 3px)",
                }}
              />
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Prose: cheating economy */}
      <ScrollReveal>
        <div className="prose prose-site max-w-none my-8">
          <p>
            <strong>The cheating economy is booming.</strong> In early 2025, 21-year-old Columbia student Chungin &ldquo;Roy&rdquo; Lee launched Interview Coder — a tool that transcribes interviewers&apos; questions via speech-to-text and generates polished coding answers in seconds, running as a translucent overlay on video calls. It generates roughly $170,000–$200,000 in monthly subscriptions at $60/month. A Blind survey found that 20% of U.S. workers admitted to secretly using AI during job interviews in 2025, and more than half said AI assistance during interviews &ldquo;has become the norm.&rdquo;
          </p>
          <p>
            <strong>Deepfake interviews have moved from science fiction to operational threat.</strong> When cybersecurity firm Pindrop posted a senior developer position, roughly 100 of 827 applicants (~12.5%) applied using fake identities. A candidate dubbed &ldquo;Ivan X&rdquo; was caught using deepfake software during a video interview — facial expressions slightly out of sync with words. Eight days later, the same person resurfaced through a different recruiter with a different appearance. Palo Alto Networks&apos; Unit 42 demonstrated that a single researcher with no deepfake experience could create a convincing synthetic identity for job interviews in just 70 minutes using consumer-grade hardware.
          </p>
          <p>
            The most concerning dimension involves <strong>North Korean operatives</strong>. The FBI has documented over 300 U.S. companies that unknowingly hired North Korean IT workers using stolen identities and AI-generated personas. In one high-profile case, cybersecurity firm KnowBe4 hired an operative who passed four video interviews, background checks, and reference calls — only discovered when the &ldquo;employee&rdquo; began installing malware. In June 2025, the DOJ announced coordinated actions including two indictments, searches of 29 laptop farms across 16 states, and seizure of financial accounts. Fourteen North Korean nationals were indicted for funneling at least $88 million into weapons programs over six years.
          </p>
        </div>
      </ScrollReveal>

      {/* Company Response Timeline */}
      <ScrollReveal>
        <div className="my-8">
          <h4
            className="mb-6 text-sm font-medium uppercase tracking-widest text-ink/50"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Company & Regulatory Responses
          </h4>
          <div className="relative ml-4 border-l border-ink/15 pl-6">
            {companyTimelineData.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="relative mb-6 last:mb-0">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[calc(1.5rem+4.5px)] top-1 h-2.5 w-2.5 border ${TYPE_COLORS[item.type]}`}
                    style={{ borderRadius: "1px" }}
                  />
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span
                      className="text-xs font-medium text-ink/50"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      {item.date}
                    </span>
                    <span
                      className={`inline-block border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${TYPE_COLORS[item.type]}`}
                    >
                      {TYPE_LABELS[item.type]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink/70">{item.event}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none my-8">
          <p>
            <strong>Companies are fighting back — partly by going analog.</strong> Amazon now explicitly bans AI tool use during interviews and disqualifies candidates caught cheating. Anthropic tells applicants: &ldquo;We want to understand your personal interest without mediation through an AI system.&rdquo; Google reinstated in-person interviews for engineering roles. Detection methods include asking candidates to wave hands in front of their face (deepfakes can&apos;t handle occlusion), requiring screen sharing, and conducting live interactive coding sessions with follow-up discussions testing understanding.
          </p>
          <p>
            Gartner predicts that by 2027, 75% of hiring processes will include certifications and tests for workplace AI proficiency — essentially testing whether candidates can use AI responsibly rather than banning it outright.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
