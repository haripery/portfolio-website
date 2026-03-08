"use client";

import { useEffect, useState } from "react";
import { TOC_SECTIONS } from "./data/tocSections";

export function TableOfContents() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    TOC_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-20% 0px -60% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav className="sticky top-0 z-40 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 px-4 sm:px-6 md:px-8 lg:px-12 py-2.5 mb-8 bg-card/80 backdrop-blur-md border-b border-ink/10">
      <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {TOC_SECTIONS.map(({ id, label }) => (
          <li key={id} className="shrink-0">
            <a
              href={`#${id}`}
              className={`block text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                activeId === id
                  ? "bg-coral/10 text-coral font-semibold"
                  : "text-ink/40 hover:text-ink/70 hover:bg-ink/[0.04]"
              }`}
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
