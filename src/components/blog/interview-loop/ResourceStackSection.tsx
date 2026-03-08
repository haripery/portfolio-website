"use client";

import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-coral transition-colors hover:text-coral/80 underline underline-offset-2"
    >
      {children}
    </a>
  );
}

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
              fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
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
                fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              DSA
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              <A href="https://leetcode.com">LeetCode</A> is non-negotiable.
              Pair it with <A href="https://neetcode.io">NeetCode</A> for
              pattern-based learning.{" "}
              <A href="https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems">
                Striver&apos;s SDE Sheet
              </A>{" "}
              has become a de facto standard for structured prep. The classic{" "}
              <A href="https://crackingthecodinginterview.com/">
                <em>Cracking the Coding Interview</em>
              </A>{" "}
              is still worth reading for the problem-solving framework, even if
              the problems themselves feel dated.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              System Design
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              <A href="https://bytebytego.com">ByteByteGo</A> by Alex Xu is the
              best visual resource. The{" "}
              <A href="https://github.com/donnemartin/system-design-primer">
                System Design Primer
              </A>{" "}
              on GitHub (280K+ stars) is the best free resource. For deep
              knowledge,{" "}
              <A href="https://dataintensive.net/">
                <em>Designing Data-Intensive Applications</em>
              </A>{" "}
              (DDIA) by Martin Kleppmann is non-negotiable at Senior+ levels.{" "}
              <A href="https://hellointerview.com">HelloInterview</A>&apos;s
              delivery framework is excellent for structuring your answers.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Low-Level Design
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              <A href="https://refactoring.guru/design-patterns">
                Refactoring Guru
              </A>{" "}
              for design patterns. The{" "}
              <A href="https://github.com/ashishps1/awesome-low-level-design">
                awesome-low-level-design
              </A>{" "}
              GitHub repo for practice problems.{" "}
              <A href="https://youtube.com/@ConceptandCoding">
                Concept &amp;&amp; Coding
              </A>{" "}
              by Shreyansh Jain on YouTube is the most popular free LLD
              resource. Machine coding rounds are increasingly common, so
              practice building systems under time constraints.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Behavioral
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              Use the STAR method.{" "}
              <A href="https://techinterviewhandbook.org/behavioral-interview/">
                The Tech Interview Handbook&apos;s behavioral section
              </A>{" "}
              is the best free starting point. For Amazon specifically,{" "}
              <A href="https://youtube.com/@DanCroitor">Dan Croitor&apos;s</A>{" "}
              YouTube channel is gold. For Google,{" "}
              <A href="https://youtube.com/@JeffHSipe">Jeff H Sipe</A>.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Frontend-Specific
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              <A href="https://greatfrontend.com">GreatFrontEnd</A> is the
              clear leader. It&apos;s the &ldquo;Blind 75 for frontend.&rdquo;{" "}
              <A href="https://bigfrontend.dev">BigFrontEnd.dev</A> for JS
              challenges.{" "}
              <A href="https://github.com/lydiahallie/javascript-questions">
                Lydia Hallie&apos;s JavaScript Questions repo
              </A>{" "}
              (65K+ stars) for tricky JS behavior.{" "}
              <A href="https://javascript.info">JavaScript.info</A> for
              fundamentals.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
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
                fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Compensation Research
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              <A href="https://levels.fyi">Levels.fyi</A> for accurate tech
              compensation data. <A href="https://ambitionbox.com">AmbitionBox</A>{" "}
              for regional salary insights.{" "}
              <A href="https://teamblind.com">Blind</A> for anonymous peer
              salary sharing.
            </p>
          </div>

          <div>
            <h3
              className="text-lg font-semibold text-forest"
              style={{
                fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              Staff+ Prep
            </h3>
            <p className="text-sm leading-relaxed text-ink/65">
              <A href="https://staffeng.com">StaffEng.com</A> for stories and
              archetypes.{" "}
              <A href="https://oreilly.com/library/view/the-staff-engineers/9781098118723/">
                <em>The Staff Engineer&apos;s Path</em>
              </A>{" "}
              by Tanya Reilly for framing leadership answers. Read engineering
              blogs obsessively. The{" "}
              <A href="https://github.com/kilimchoi/engineering-blogs">
                kilimchoi/engineering-blogs
              </A>{" "}
              repo aggregates hundreds of them.
            </p>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
