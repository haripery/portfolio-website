"use client";

import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";

export function FinalThoughtsSection() {
  return (
    <ScrollReveal>
      <section id="final-thoughts" className="mb-10 scroll-mt-24">
        <div className="mb-8">
          <p
            className="mb-2 text-xs uppercase tracking-widest text-coral"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            04. Final Thoughts
          </p>
          <h2
            className="text-2xl font-bold tracking-tight text-forest md:text-3xl"
            style={{
              fontFamily:
                "var(--font-space-grotesk), system-ui, sans-serif",
            }}
          >
            Wrapping Up
          </h2>
        </div>

        <div className="prose prose-site max-w-none">
          <p className="text-sm leading-relaxed text-ink/65">
            The interview game varies by company, region, and level, but the
            underlying structure is remarkably consistent. New grad loops test
            raw problem-solving. Senior loops add system design and behavioral
            depth. Staff loops test whether you can think beyond code.
          </p>

          <p className="text-sm leading-relaxed text-ink/65">
            The best preparation strategy: identify which round types your
            target companies emphasize, then go deep on 3-4 resource
            categories rather than spreading thin across all of them.
          </p>

          <div className="mt-8 border border-coral/20 bg-coral/5 p-5">
            <p className="text-sm leading-relaxed text-ink/65">
              If you&apos;re preparing and want to talk through your strategy,{" "}
              <a
                href="https://adplist.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral transition-colors hover:text-coral/80"
              >
                find me on ADPList
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
