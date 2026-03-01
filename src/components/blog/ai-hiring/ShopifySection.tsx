"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { StatCard } from "./shared/StatCard";

export function ShopifySection() {
  return (
    <section className="py-16">
      <SectionHeader
        title={`Shopify: "Prove AI Can't Do the Job Before You Hire Anyone"`}
        id="shopify"
      />

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <p>
            Shopify&apos;s transformation starts before the interview. In April 2025, CEO Tobi L&uuml;tke shared an internal memo, later posted on X after it leaked, titled &ldquo;AI usage is now a baseline expectation&rdquo; [8]. The directive that sent shockwaves through the industry: <strong>before requesting new headcount, every team must first demonstrate why AI can&apos;t do the work.</strong>
          </p>
          <p>
            The exact framing from the memo: <em>&ldquo;Before asking for more headcount and resources, teams must demonstrate why they cannot get what they want done using AI. What would this area look like if autonomous AI agents were already part of the team?&rdquo;</em> [8]
          </p>
        </div>
      </ScrollReveal>

      {/* Key metrics */}
      <ScrollReveal>
        <div className="my-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="border border-coral/30 bg-coral/5 p-5">
            <p
              className="text-2xl font-bold text-coral"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              -10%
            </p>
            <p className="text-xs text-ink/60">Workforce cut 2022</p>
          </div>
          <div className="border border-coral/30 bg-coral/5 p-5">
            <p
              className="text-2xl font-bold text-coral"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              -20%
            </p>
            <p className="text-xs text-ink/60">Workforce cut 2023</p>
          </div>
          <div className="border border-mint/30 bg-mint/5 p-5">
            <p
              className="text-2xl font-bold text-mint"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              +25%
            </p>
            <p className="text-xs text-ink/60">Revenue growth Q1</p>
          </div>
          <div className="border border-mint/30 bg-mint/5 p-5">
            <p
              className="text-2xl font-bold text-mint"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              $1.51B
            </p>
            <p className="text-xs text-ink/60">Q1 Revenue</p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none">
          <h3>AI Woven Into Culture, Not Just Tools</h3>
          <p>
            This isn&apos;t a suggestion. AI usage is now factored into Shopify&apos;s performance and peer review process. Every employee, including L&uuml;tke and the executive team, is evaluated on how effectively they leverage AI [8]. The memo made clear that &ldquo;reflexive AI usage&rdquo; is now the baseline expectation for everyone at the company [9].
          </p>
          <p>
            The context makes the policy even more striking. Shopify cut its workforce by 10% in 2022 and 20% in 2023, reducing headcount to around 11,600 [10]. Yet revenue grew 25% to $1.51 billion in Q1 during the same period [10]. The company launched Sidekick (a merchant-facing AI chatbot), Shopify Magic (AI-generated product descriptions), an OpenAI-powered translation bot inside its internal chat tool Athena, and automated email response systems [10]. Fewer people, better AI tooling, more output.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none mt-8">
          <h3>What the Interview Looks Like</h3>
          <p>
            Shopify&apos;s engineering interview process includes three main stages: an online assessment (typically 3 questions covering algorithm problems and language-specific challenges), a technical round focused on system design where AI use is allowed and encouraged, and what Shopify calls the &ldquo;Life Story&rdquo; interview, a deep behavioral conversation about who you are, how you think, and what drives you [11][12].
          </p>
          <p>
            The Life Story round is distinctly Shopify. The company says &ldquo;we hire people, not resumes&rdquo; [12] and sends candidates specific articles and documentation to prepare for this round. It evaluates growth, resilience, decision-making under pressure, and alignment with Shopify&apos;s merchant-first mission [11]. No AI tool can fake a genuine narrative about your failures and what you learned from them.
          </p>
          <p>
            L&uuml;tke captured the cultural ethos in one line: <em>&ldquo;If you&apos;re not climbing, you&apos;re sliding.&rdquo;</em> [8]
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
