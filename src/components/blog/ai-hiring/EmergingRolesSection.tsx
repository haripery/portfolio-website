"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { RoleGrowthChart } from "./charts/RoleGrowthChart";
import { SalaryRangeChart } from "./charts/SalaryRangeChart";
import { EntryLevelSqueezeChart } from "./charts/EntryLevelSqueezeChart";

export function EmergingRolesSection() {
  return (
    <section className="py-16">
      <SectionHeader
        number="05"
        title="New Roles Are Emerging as Fast as Old Ones Disappear"
        subtitle="The AI transformation isn't just changing how you get hired — it's redefining what you get hired to do."
        id="emerging-roles"
      />

      <RoleGrowthChart />

      <ScrollReveal>
        <div className="prose prose-site max-w-none my-8">
          <p>
            <strong>AI/ML Engineer</strong> is LinkedIn&apos;s #1 fastest-growing job title for 2026, with postings rising 143% year-over-year. Entry-level compensation starts at $100,000–$173,000 and climbs to $195,000–$350,000+ for senior roles. At Meta, AI engineers average $201,906 base with total compensation reaching $451,000. The demand-to-supply ratio sits at 3.2:1 — meaning three open positions for every qualified candidate.
          </p>
          <p>
            <strong>Agentic AI Engineer</strong> is the breakout category, with job postings exploding 985% between 2023 and 2024. These roles — building autonomous AI systems that can plan, reason, and execute multi-step tasks — command $120,000–$400,000+ in total compensation. Skills in LangChain, LlamaIndex, and multi-step reasoning pipelines are the differentiators.
          </p>
          <p>
            <strong>Prompt Engineer</strong> demand surged 135.8% in 2025, with the global market expected to expand 350% through 2026. Senior prompt engineers at top firms earn $200,000–$270,000+. Google pays prompt engineers a median total of approximately $245,000.
          </p>
          <p>
            <strong>AI Ethics and Governance</strong> roles are surging as regulation expands. Demand is up 150%, and Forrester predicts 60% of Fortune 100 companies will appoint a head of AI governance by end of 2026. These roles pay $120,000–$280,000 and offer an accessible path for students interested in the intersection of technology and policy.
          </p>
        </div>
      </ScrollReveal>

      <SalaryRangeChart />

      <EntryLevelSqueezeChart />

      <ScrollReveal>
        <div className="prose prose-site max-w-none my-8">
          <p>
            The flip side: traditional entry-level roles face headwinds. A Harvard study found that when companies adopt generative AI, junior developer employment drops roughly 9–10% within six quarters, while senior employment barely budges. U.S. programmer employment fell 27.5% between 2023 and 2025 per BLS data — but software developer employment fell only 0.3%, indicating a shift from pure coding to design-oriented, AI-orchestration roles.
          </p>
          <p>
            The World Economic Forum projects 170 million new jobs created by 2030 alongside 92 million displaced — a net gain of 78 million, but the transition will be turbulent for those unprepared.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
