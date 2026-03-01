"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { AnimatedCounter } from "./shared/AnimatedCounter";
import { ApplicationVolumeChart } from "./charts/ApplicationVolumeChart";
import { HumanCostBars } from "./charts/HumanCostBars";
import { csGradData } from "./data/chartData";

const LOOP_STEPS = [
  { text: "Candidates use AI to mass-apply", stat: "58% use AI tools" },
  { text: "Application volume explodes", stat: "222/job, 3x since 2021" },
  { text: "Companies deploy harsher AI filters", stat: "90% see spam rise" },
  { text: "Qualified candidates get filtered out", stat: "75% auto-rejected" },
  { text: "Candidates apply to MORE jobs to compensate…", stat: "Cycle repeats" },
];

export function DoomLoopSection() {
  return (
    <section className="py-16">
      <SectionHeader
        number="02"
        title="The AI Arms Race Is Making Hiring Worse for Everyone"
        subtitle='The most counterintuitive development in hiring is that AI tools — designed to make the process faster and better — have instead created what Greenhouse CEO Jon Stross calls an "AI doom loop" making everyone miserable.'
        id="doom-loop"
      />

      {/* Doom Loop Cycle Diagram */}
      <ScrollReveal>
        <div className="mb-12 border border-ink/15 bg-card p-6 md:p-8">
          <h4
            className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-ink/50"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            The AI Doom Loop
          </h4>
          <div className="relative mx-auto max-w-md">
            {LOOP_STEPS.map((step, i) => (
              <div key={i} className="relative mb-4 last:mb-0">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center border border-coral/40 text-xs font-bold text-coral"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace", animation: "ai-hiring-pulse 3s ease-in-out infinite", animationDelay: `${i * 0.6}s` }}
                    >
                      {i + 1}
                    </div>
                    {i < LOOP_STEPS.length - 1 && (
                      <div className="h-4 w-px bg-coral/30" />
                    )}
                    {i === LOOP_STEPS.length - 1 && (
                      <div className="mt-1 text-coral text-xs">↻</div>
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-forest">{step.text}</p>
                    <p
                      className="text-xs text-ink/50"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      {step.stat}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Application Volume Chart */}
      <ApplicationVolumeChart />

      {/* Prose: the arms race */}
      <ScrollReveal>
        <div className="prose prose-site max-w-none my-8">
          <p>
            The cycle works like this. Candidates use tools like LazyApply, Sonara, AIApply, and Simplify to mass-apply to hundreds of jobs. <strong>58% of candidates use AI tools</strong> in their job search, and those who do complete 41% more applications than those who don&apos;t. An estimated 40–80% of applicants use AI to write résumés and cover letters. The average job seeker now sends 16 applications per week, and the most aggressive 10% fire off 83 per week. Applications per job opening hit 222 in Q1 2024 — nearly 3x the rate at end of 2021.
          </p>
          <p>
            Companies respond by deploying harsher AI filters. 90% of hiring managers report an increase in low-effort or spammy applications driven by AI tools. 70–80% of applicants don&apos;t meet basic qualifications. Each minute a recruiter spends reviewing an unqualified résumé costs approximately $7.50 in lost productivity. So companies crank up the AI screening — and qualified candidates with non-standard backgrounds or formatting issues get rejected alongside the spam. Cold online application success rates have collapsed from roughly 5% a decade ago to <strong>0.1–2%</strong> today.
          </p>
        </div>
      </ScrollReveal>

      {/* Human Cost Bars */}
      <HumanCostBars />

      {/* CS Graduate Reality Check */}
      <ScrollReveal>
        <div className="my-8 border border-coral/30 bg-coral/5 p-6 md:p-8">
          <h4
            className="mb-4 text-sm font-medium uppercase tracking-widest text-coral"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            CS Graduates vs. Other Majors — Unemployment Rate
          </h4>
          <div className="space-y-3">
            {csGradData.map((item) => (
              <div key={item.major}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span
                    className={`text-sm ${
                      item.major === "CS Graduates" ? "font-bold text-forest" : "text-ink/70"
                    }`}
                  >
                    {item.major}
                  </span>
                  <span
                    className={`text-sm ${
                      item.major === "CS Graduates" ? "font-bold text-coral" : "text-ink/50"
                    }`}
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                  >
                    <AnimatedCounter end={item.rate} suffix="%" decimals={1} />
                  </span>
                </div>
                <div className="h-3 w-full bg-ink/5 rounded-sm">
                  <div
                    className={`h-full rounded-sm transition-all ${
                      item.major === "CS Graduates" ? "bg-coral/70" : "bg-ink/20"
                    }`}
                    style={{ width: `${(item.rate / 7) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink/50">
            Only <strong className="text-forest">7%</strong> of Big Tech new hires were recent graduates in 2024. Entry-level positions saw a 73% decrease in hiring rates.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="prose prose-site max-w-none my-8">
          <p>
            The human toll is significant. 61% of job seekers report being ghosted after interviews — up 9 percentage points since 2024. An estimated 27% of job postings are ghost jobs that will never result in a hire. 72% of job seekers say the search negatively affects their mental health. On the employer side, 53% of recruiters experienced burnout in the past year, and recruiter workload increased 26% in a single quarter due to AI-enabled application floods.
          </p>
          <p>
            Recent CS graduates face a <strong>6.1% unemployment rate</strong> — higher than philosophy majors (3.2%) or art history majors (3.0%). Overall underemployment for recent college graduates hit 42.5% in Q4 2025, the highest since 2020. Entry-level positions saw a 73% decrease in hiring rates compared to just a 7% decrease across all levels.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
