"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";

const SECTIONS = [
  { id: "about", label: "About", n: "01" },
  { id: "experience", label: "Experience", n: "02" },
  { id: "projects", label: "Projects", n: "03" },
  { id: "blog", label: "Writing", n: "04" },
];

export function ScrollNav() {
  const [active, setActive] = useState("about");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <ul className="mt-2 space-y-0.5">
        {SECTIONS.map(({ id, label, n }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={() =>
                posthog.capture("section_navigated", { section: label })
              }
              className={`group flex items-center gap-3 py-1.5 transition-all duration-200 ${
                active === id
                  ? "text-forest"
                  : "text-ink/45 hover:text-forest"
              }`}
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              <span
                className={`flex-shrink-0 text-coral text-[10px] transition-opacity duration-200 ${
                  active === id ? "opacity-100" : "opacity-50 group-hover:opacity-100"
                }`}
              >
                {n}.
              </span>
              <span className="text-[10px] uppercase tracking-widest">
                {label}
              </span>
              {active === id && (
                <span className="ml-1 h-px flex-1 bg-forest opacity-30" />
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
