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
            Shopify has been one of the clearest voices in tech on making AI a core part of how the company operates. In April 2025, CEO Tobi L&uuml;tke shared an internal memo that laid it out directly: AI isn&apos;t an optional add-on at Shopify. It&apos;s foundational to how teams build [8]. The company has shipped AI-powered products at remarkable speed, including Sidekick (a merchant-facing AI chatbot), Shopify Magic (AI-generated product descriptions), and an OpenAI-powered translation bot inside its internal chat tool Athena [10].
          </p>
          <p>
            Revenue grew 25% to $1.51 billion in Q1, reflecting how well AI-augmented workflows have been working across the company [10]. Shopify&apos;s bet is that treating AI as a genuine collaborator, not a novelty, produces better products faster.
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
              +<AnimatedCounter end={25} suffix="%" />
            </p>
            <p className="text-xs text-ink/60 mt-1">Revenue growth Q1</p>
          </div>
          <div className="border border-mint/30 bg-mint/5 p-6 text-center">
            <p
              className="text-3xl font-bold text-mint"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              $<AnimatedCounter end={1.51} suffix="B" decimals={2} />
            </p>
            <p className="text-xs text-ink/60 mt-1">Q1 Revenue</p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <h3>How Shopify Interviews Engineers</h3>
          <p>
            Shopify&apos;s engineering interview reflects this AI-first culture. The process includes three main stages: an online assessment (typically 3 questions covering algorithm problems and language-specific challenges), a technical round focused on system design where AI use is allowed and encouraged, and what Shopify calls the &ldquo;Life Story&rdquo; interview [11][12].
          </p>
          <p>
            The technical round is essentially a pair programming session. Candidates are expected to use AI tools the way they would on the job. The evaluation isn&apos;t about whether you can solve the problem from scratch. It&apos;s about how you decompose it, how you collaborate with AI to work through it, and whether you can reason about the output critically. Shopify wants to see how you actually build, not how you perform under artificial constraints.
          </p>
          <p>
            The Life Story round is distinctly Shopify. The company says &ldquo;we hire people, not resumes&rdquo; [12] and sends candidates specific articles and documentation to prepare for this round. It&apos;s a deep conversation about who you are, how you think, and what drives you. Growth, resilience, decision-making under pressure, and alignment with Shopify&apos;s merchant-first mission are what matter here [11]. No AI tool can fake a genuine narrative about your failures and what you learned from them.
          </p>
          <p>
            L&uuml;tke captured the cultural ethos in one line: <em>&ldquo;If you&apos;re not climbing, you&apos;re sliding.&rdquo;</em> [8]
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
