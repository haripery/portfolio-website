"use client";

import { SectionHeader } from "./shared/SectionHeader";
import { ScrollReveal } from "./shared/ScrollReveal";
import { sources } from "./data/chartData";

export function SourcesSection() {
  return (
    <section className="py-16">
      <SectionHeader title="Sources" id="sources" />

      <ScrollReveal>
        <div className="space-y-2">
          {sources.map((source) => (
            <p key={source.id} className="text-xs text-ink/50 leading-relaxed flex gap-2">
              <span
                className="shrink-0 text-ink/30"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                [{source.id}]
              </span>
              <span>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-coral/70 hover:text-coral transition-colors"
                  >
                    {source.text}
                  </a>
                ) : (
                  source.text
                )}
              </span>
            </p>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
