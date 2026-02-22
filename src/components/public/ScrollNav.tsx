"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Writing" },
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
      <ul className="mt-2 space-y-1">
        {SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`group flex items-center gap-4 py-1 transition-all duration-200 ${
                active === id
                  ? "text-[#e2e8f0]"
                  : "text-[#94a3b8] hover:text-[#e2e8f0]"
              }`}
            >
              <span
                className={`block h-px bg-current transition-all duration-200 ${
                  active === id
                    ? "w-16"
                    : "w-8 group-hover:w-16"
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-widest">
                {label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
