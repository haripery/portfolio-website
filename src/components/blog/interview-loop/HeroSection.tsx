"use client";

import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";

export function HeroSection() {
  return (
    <ScrollReveal>
      <section id="hero" className="mb-20 scroll-mt-24">
        <div className="prose prose-site max-w-none">
          <p className="text-base leading-relaxed text-ink/65">
            I mentor engineers on{" "}
            <a
              href="https://adplist.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral transition-colors hover:text-coral/80"
            >
              ADPList
            </a>{" "}
            , from fresh CS grads to senior engineers pivoting to staff roles.
            The #1 question I get:{" "}
            <em>
              &ldquo;What does the actual interview process look like, and how
              do I prepare?&rdquo;
            </em>
          </p>

          <p className="text-base leading-relaxed text-ink/65">
            This guide is my answer. It maps every round and every resource
            across three levels:{" "}
            <strong className="text-forest">New Grad</strong>,{" "}
            <strong className="text-forest">Senior</strong>, and{" "}
            <strong className="text-forest">Staff</strong>.
          </p>

          <div className="mt-8 border border-coral/20 bg-coral/5 p-5">
            <p
              className="mb-1 text-xs uppercase tracking-widest text-coral"
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              Step 0
            </p>
            <p className="text-sm leading-relaxed text-ink/65">
              Before anything, figure out your path. Visit{" "}
              <a
                href="https://roadmap.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral transition-colors hover:text-coral/80"
              >
                roadmap.sh
              </a>{" "}
              to understand what you want to become (frontend, backend,
              full-stack, DevOps, AI/ML) then prepare accordingly.
            </p>
          </div>

          <div className="mt-6 border border-coral/20 bg-coral/5 p-5">
            <p
              className="mb-1 text-xs uppercase tracking-widest text-coral"
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              Step 0.5: Your Recruiter Is Your Biggest Ally
            </p>
            <p className="text-sm leading-relaxed text-ink/65">
              The recruiter is not a gatekeeper. They&apos;re your biggest
              friend in the process. Once you&apos;re scheduled, ask them for
              the full structure of the interview: how many rounds, what each
              round covers, who you&apos;ll be speaking with, and what to
              focus on. The best recruiters will proactively share prep
              materials, tell you exactly what the team values, and even coach
              you on what a strong answer looks like. Don&apos;t be shy.
              Ask questions, ask for context, and use every bit of information
              they give you. A 15-minute recruiter call can save you weeks of
              unfocused preparation.
            </p>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
