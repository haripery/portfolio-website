"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ChevronDown } from "lucide-react";

export type PageSection = { id: string; label: string };

const MONO = { fontFamily: "var(--font-jetbrains-mono), monospace" };
const NAV_EVENT = "careermap:navigate";
// Fixed top bar plus the sections' scroll margin
const TOP_OFFSET = 100;
const TOP: PageSection = { id: "top", label: "Top" };

function jump(id: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduce ? "instant" : "smooth";
  if (id === TOP.id) {
    window.scrollTo({ top: 0, behavior });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
}

type Progress = {
  /** The sections exist on the current page (not while zoomed into a company) */
  present: boolean;
  /** The reader has scrolled into the sections */
  inSections: boolean;
  active: string | null;
  /** 0 at the top of the page, nodeCount - 1 at the end; fractional between nodes */
  position: number;
  nodeCount: number;
};

const IDLE: Progress = { present: false, inSections: false, active: null, position: 0, nodeCount: 1 };

/** Where the reader is among the page's sections. Re-measures on scroll, resize and zoom changes. */
export function useSectionProgress(sections: PageSection[]) {
  const [progress, setProgress] = useState<Progress>(IDLE);

  useEffect(() => {
    let timer = 0;
    const measure = () => {
      timer = 0;
      const tops = sections
        .map((section) => ({ id: section.id, el: document.getElementById(section.id) }))
        .filter((entry): entry is { id: string; el: HTMLElement } => entry.el !== null)
        .map((entry) => ({ id: entry.id, top: entry.el.getBoundingClientRect().top + window.scrollY - TOP_OFFSET }));
      if (tops.length === 0) {
        setProgress((current) => (current.present ? IDLE : current));
        return;
      }
      const y = window.scrollY;
      const end = Math.max(document.documentElement.scrollHeight - window.innerHeight, tops[tops.length - 1].top + 1);
      const nodes = [0, ...tops.map((t) => t.top), end];
      let index = 0;
      while (index < nodes.length - 2 && y >= nodes[index + 1]) index++;
      const span = Math.max(1, nodes[index + 1] - nodes[index]);
      const position = Math.min(nodes.length - 2, index + Math.max(0, Math.min(1, (y - nodes[index]) / span)));
      const active = index === 0 ? null : tops[index - 1].id;
      setProgress({ present: true, inSections: index > 0, active, position, nodeCount: nodes.length - 1 });
    };
    // A short timer rather than requestAnimationFrame: it throttles scroll
    // events the same way and still runs when frames are paused.
    const schedule = () => {
      if (!timer) timer = window.setTimeout(measure, 60);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener(NAV_EVENT, schedule);
    window.addEventListener("popstate", schedule);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener(NAV_EVENT, schedule);
      window.removeEventListener("popstate", schedule);
    };
  }, [sections]);

  return progress;
}

/** One line under the summary telling the reader what is further down */
export function SectionStrip({ sections }: { sections: PageSection[] }) {
  return (
    <nav
      aria-label="On this page"
      className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-widest text-ink/60"
      style={MONO}
    >
      <ArrowDown className="h-3.5 w-3.5 text-coral" aria-hidden="true" />
      {sections.map((section, index) => (
        <span key={section.id} className="flex items-center gap-x-3">
          {index > 0 && (
            <span aria-hidden="true" className="text-ink/30">
              ·
            </span>
          )}
          <a href={`#${section.id}`} className="py-2 transition-colors hover:text-forest">
            {section.label}
          </a>
        </span>
      ))}
    </nav>
  );
}

/** Wide screens: a line in the left gutter that fills as you read, with a marker per section */
export function SectionSpine({ sections }: { sections: PageSection[] }) {
  const { present, active, position, nodeCount } = useSectionProgress(sections);
  if (!present) return null;
  const fill = nodeCount > 1 ? (position / (nodeCount - 1)) * 100 : 0;
  return (
    <nav
      aria-label="Sections"
      className="fixed top-1/2 z-40 hidden -translate-y-1/2 min-[1440px]:block"
      style={{ left: "max(32px, calc((100vw - 1280px) / 2 + 32px))" }}
    >
      <ol className="relative flex flex-col gap-7">
        <span aria-hidden="true" className="absolute left-[3px] top-1 h-[calc(100%-0.5rem)] w-px bg-ink/15" />
        <span
          aria-hidden="true"
          className="absolute left-[3px] top-1 w-px bg-gold transition-[height] duration-150"
          style={{ height: `calc((100% - 0.5rem) * ${fill / 100})` }}
        />
        {[TOP, ...sections].map((section) => {
          const on = section.id === TOP.id ? active === null : active === section.id;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => jump(section.id)}
                aria-current={on ? "location" : undefined}
                className={`group relative flex items-center gap-3 text-[10px] uppercase tracking-widest transition-colors ${
                  on ? "text-forest" : "text-ink/45 hover:text-forest"
                }`}
                style={MONO}
              >
                <span
                  aria-hidden="true"
                  className={`h-[7px] w-[7px] border transition-colors ${
                    on ? "border-gold bg-gold" : "border-ink/40 bg-paper group-hover:border-forest"
                  }`}
                />
                {section.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Narrower screens: the current section's name in the fixed top bar, opening a list to jump */
export function SectionBarLabel({ sections }: { sections: PageSection[] }) {
  const { present, inSections, active } = useSectionProgress(sections);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && (event.target as Element | null)?.closest("[data-section-menu]")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!present || !inSections) return null;
  const current = sections.find((section) => section.id === active);

  return (
    <div className="relative min-[1440px]:hidden" data-section-menu>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-9 items-center gap-2 px-2 text-[10px] uppercase tracking-widest text-ink/60 transition-colors hover:text-forest"
        style={MONO}
      >
        <span aria-hidden="true" className="h-[7px] w-[7px] border border-gold bg-gold" />
        {current?.label ?? TOP.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-[11rem] border border-ink/15 bg-paper p-1"
          style={{ borderRadius: 2 }}
        >
          {[TOP, ...sections].map((section) => (
            <li key={section.id} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  jump(section.id);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-[11px] uppercase tracking-widest transition-colors hover:bg-forest/7 ${
                  (section.id === TOP.id ? active === null : active === section.id) ? "text-forest" : "text-ink/60"
                }`}
                style={MONO}
              >
                <span
                  aria-hidden="true"
                  className={`h-[7px] w-[7px] border ${
                    (section.id === TOP.id ? active === null : active === section.id)
                      ? "border-gold bg-gold"
                      : "border-ink/40"
                  }`}
                />
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Narrower screens: a hairline along the bottom of the top bar showing reading progress */
export function SectionBarProgress({ sections }: { sections: PageSection[] }) {
  const { present, inSections, position, nodeCount } = useSectionProgress(sections);
  if (!present || !inSections) return null;
  const fill = nodeCount > 1 ? (position / (nodeCount - 1)) * 100 : 0;
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-0 left-0 h-0.5 bg-gold transition-[width] duration-150 min-[1440px]:hidden"
      style={{ width: `${fill}%` }}
    />
  );
}
