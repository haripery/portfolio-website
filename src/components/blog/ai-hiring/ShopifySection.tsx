"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { AnimatedCounter } from "./shared/AnimatedCounter";

export function ShopifySection() {
  return (
    <section className="py-16">
      <SectionHeader
        title="Shopify: AI-First From Day One"
        id="shopify"
      />

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            Shopify has been one of the clearest voices in tech on making AI a core part of how the company operates. In April 2025, CEO Tobi L&uuml;tke shared an internal memo that laid it out directly: AI isn&apos;t an optional add-on at Shopify. It&apos;s foundational to how teams build <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[8]</a>. The company has shipped AI-powered products at remarkable speed, including Sidekick (a merchant-facing AI chatbot), Shopify Magic (AI-generated product descriptions), and an OpenAI-powered translation bot inside its internal chat tool Athena.
          </p>
          <p>
            Revenue grew 27% to $2.36 billion in Q1 2025, reflecting how well AI-augmented workflows have been working across the company <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[10]</a>. Shopify&apos;s bet is that treating AI as a genuine collaborator, not a novelty, produces better products faster.
          </p>
        </div>
      </ScrollReveal>

      {/* Revenue highlight */}
      <ScrollReveal>
        <div className="my-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-mint/30 bg-mint/5 p-6 text-center">
            <p
              className="text-3xl font-bold text-mint"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              +<AnimatedCounter end={27} suffix="%" />
            </p>
            <p className="text-xs text-ink/60 mt-1">Revenue growth Q1 2025</p>
          </div>
          <div className="border border-mint/30 bg-mint/5 p-6 text-center">
            <p
              className="text-3xl font-bold text-mint"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              $<AnimatedCounter end={2.36} suffix="B" decimals={2} />
            </p>
            <p className="text-xs text-ink/60 mt-1">Q1 2025 Revenue</p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <h3>How Shopify Interviews Engineers</h3>
          <p>
            Shopify&apos;s engineering interview reflects this culture. The process includes a coding exercise, a pair programming session, a technical deep dive focused on system design, and what Shopify calls the &ldquo;Life Story&rdquo; interview <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[11]</a>.
          </p>
          <p>
            The technical rounds evaluate how you decompose problems, reason about trade-offs, and communicate your thinking. Shopify&apos;s engineering blog emphasizes that the interview is a conversation, not a test. They want to see how you actually think through problems, not how you perform under artificial constraints <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[11]</a>.
          </p>
          <p>
            The Life Story round is distinctly Shopify. It&apos;s a deep conversation about who you are, how you think, and what drives you. Shopify evaluates five traits: Impact, Readiness, Trust, Engagement, and Self-awareness <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[11]</a>. No AI tool can fake a genuine narrative about your failures and what you learned from them.
          </p>
          <p>
            L&uuml;tke captured the cultural ethos in one line: <em>&ldquo;If you&apos;re not climbing, you&apos;re sliding.&rdquo;</em> <a href="#sources" className="!text-coral/50 hover:!text-coral !no-underline">[8]</a>
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
