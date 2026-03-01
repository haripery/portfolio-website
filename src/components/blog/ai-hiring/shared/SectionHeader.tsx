"use client";

import { ScrollReveal } from "./ScrollReveal";

export function SectionHeader({
  number,
  title,
  subtitle,
  id,
}: {
  number?: string;
  title: string;
  subtitle?: string;
  id: string;
}) {
  return (
    <ScrollReveal>
      <div id={id} className="mb-10 scroll-mt-24">
        {number && (
          <p
            className="mb-2 text-xs uppercase tracking-widest text-coral"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {number}
          </p>
        )}
        <h2
          className="text-2xl font-bold tracking-tight text-forest md:text-3xl"
          style={{
            fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-base text-ink/60 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </ScrollReveal>
  );
}
