"use client";

import { useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import { ExperienceCard } from "./ExperienceCard";
import type { ExperienceWithRelations } from "@/types";

export function ExperienceSection({
  experiences,
}: {
  experiences: ExperienceWithRelations[];
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Only tags shared by two or more roles make useful filters
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    experiences.forEach((exp) =>
      new Set(exp.tags.map((t) => t.label)).forEach((label) =>
        counts.set(label, (counts.get(label) ?? 0) + 1)
      )
    );
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => label);
  }, [experiences]);

  // Arriving from an Impact metric: clear the filter so the target isn't dimmed
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash.startsWith("#exp-")) setActiveTag(null);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function select(tag: string | null) {
    setActiveTag(tag);
    posthog.capture("experience_tag_filtered", { tag: tag ?? "all" });
  }

  return (
    <>
      {tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Highlight experience by tag">
          {[null, ...tags].map((tag) => {
            const isActive = activeTag === tag;
            return (
              <li key={tag ?? "all"}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => select(tag)}
                  className={`inline-flex items-center border px-2 py-0.5 text-[10px] font-medium uppercase leading-4 tracking-wider text-forest transition-colors ${
                    isActive
                      ? "border-gold bg-gold/30"
                      : "border-forest/25 bg-forest/7 hover:border-gold"
                  }`}
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace", borderRadius: "2px" }}
                >
                  {tag ?? "All"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ol className="mt-2 divide-y divide-ink/10">
        {experiences.map((exp) => {
          const matches =
            activeTag !== null && exp.tags.some((t) => t.label === activeTag);
          return (
            <li key={exp.id} className="py-1">
              <ExperienceCard
                exp={exp}
                highlighted={matches}
                dimmed={activeTag !== null && !matches}
              />
            </li>
          );
        })}
      </ol>
    </>
  );
}
