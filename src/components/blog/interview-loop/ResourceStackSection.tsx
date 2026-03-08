"use client";

import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";

export function ResourceStackSection() {
  return (
    <ScrollReveal>
      <section id="resource-stack" className="mb-20 scroll-mt-24">
        <div className="mb-8">
          <p
            className="mb-2 text-xs uppercase tracking-widest text-coral"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            03. Recommendations
          </p>
          <h2
            className="text-2xl font-bold tracking-tight text-forest md:text-3xl"
            style={{
              fontFamily:
                "var(--font-space-grotesk), system-ui, sans-serif",
            }}
          >
            The Resource Stack
          </h2>
        </div>

        <div className="prose prose-site max-w-none space-y-6">
          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              DSA
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              LeetCode is non-negotiable. Pair it with NeetCode for
              pattern-based learning. Striver&apos;s SDE Sheet has become a de
              facto standard for structured prep. The classic{" "}
              <em>Cracking the Coding Interview</em> is still worth reading
              for the problem-solving framework, even if the problems
              themselves feel dated.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              System Design
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              ByteByteGo by Alex Xu is the best visual resource. The System
              Design Primer on GitHub (280K+ stars) is the best free resource.
              For deep knowledge,{" "}
              <em>Designing Data-Intensive Applications</em> (DDIA) by Martin
              Kleppmann is non-negotiable at Senior+ levels.
              HelloInterview&apos;s delivery framework is excellent for
              structuring your answers.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Low-Level Design
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              Refactoring Guru for design patterns. The
              awesome-low-level-design GitHub repo for practice problems.
              Concept &amp;&amp; Coding by Shreyansh Jain on YouTube is the
              most popular free LLD resource. Machine coding rounds are
              increasingly common, so practice building systems under time
              constraints.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Behavioral
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              Use the STAR method. The Tech Interview Handbook&apos;s
              behavioral section is the best free starting point. For Amazon
              specifically, Dan Croitor&apos;s YouTube channel is gold. For
              Google, Jeff H Sipe.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Frontend-Specific
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              GreatFrontEnd is the clear leader. It&apos;s the &ldquo;Blind
              75 for frontend.&rdquo; BigFrontEnd.dev for JS challenges. Lydia
              Hallie&apos;s JavaScript Questions repo (65K+ stars) for tricky
              JS behavior. JavaScript.info for fundamentals.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Debugging (Stripe-style)
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              No dedicated platform exists. Clone open-source repos, introduce
              bugs, set a timer, and practice fixing them while narrating your
              thought process. Read the Stripe debugging guides on Medium.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Compensation Research
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              Levels.fyi for accurate tech compensation data. AmbitionBox for
              regional salary insights. Blind for anonymous peer salary
              sharing.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Staff+ Prep
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              StaffEng.com for stories and archetypes.{" "}
              <em>The Staff Engineer&apos;s Path</em> by Tanya Reilly for
              framing leadership answers. Read engineering blogs obsessively.
              The kilimchoi/engineering-blogs repo aggregates hundreds of them.
            </p>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
