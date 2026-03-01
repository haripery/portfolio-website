"use client";

import { useEffect, useState } from "react";
import { tocSections } from "../data/chartData";

export function TableOfContents() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    tocSections.forEach(({ id }) => {
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
    <nav className="hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 z-40">
      <ul className="space-y-3">
        {tocSections.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-xs transition-colors ${
                activeId === id
                  ? "text-coral font-medium"
                  : "text-ink/40 hover:text-ink/70"
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
