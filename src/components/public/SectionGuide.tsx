"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ChevronDown } from "lucide-react";

export type PageSection = { id: string; label: string };

const MONO = { fontFamily: "var(--font-jetbrains-mono), monospace" };
const NAV_EVENT = "careermap:navigate";
// Fixed top bar plus the sections' scroll margin
const TOP_OFFSET = 100;
const TOP: PageSection = { id: "top", label: "Top" };

// Gold reads fine as a shape but not as a 1-2px line on paper, so the thin
// indicators use the darker gold in light mode and true gold in dark mode.
const LINE = "bg-[#8A6A00] dark:bg-gold";
const MARK_ON = "border-[#8A6A00] bg-[#8A6A00] dark:border-gold dark:bg-gold";

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
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const nodes = [0, ...tops.map((t) => t.top), Math.max(maxScroll, tops[tops.length - 1].top + 1)];
      const last = nodes.length - 2;
      let index = 0;
      while (index < last && y >= nodes[index + 1]) index++;
      // A short last section may never reach the top of the viewport; the
      // bottom of the page counts as being in it
      const atEnd = y >= maxScroll - 2;
      if (atEnd) index = last;
      const span = Math.max(1, nodes[index + 1] - nodes[index]);
      const position = atEnd ? last : Math.min(last, index + Math.max(0, Math.min(1, (y - nodes[index]) / span)));
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
      className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-widest text-ink/75"
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
      // Right edge 16px short of where the content column starts
      // (the 1280px container is centred and has 96px of padding)
      style={{ right: "calc(50% + 560px)" }}
    >
      <ol className="relative flex flex-col gap-7">
        <span aria-hidden="true" className="absolute left-[3px] top-1 h-[calc(100%-0.5rem)] w-px bg-ink/20" />
        <span
          aria-hidden="true"
          className={`absolute left-[3px] top-1 w-px transition-[height] duration-150 motion-reduce:transition-none ${LINE}`}
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
                  on ? "text-forest" : "text-ink/75 hover:text-forest"
                }`}
                style={MONO}
              >
                <span
                  aria-hidden="true"
                  className={`h-[7px] w-[7px] border transition-colors ${
                    on ? MARK_ON : "border-ink/60 bg-paper group-hover:border-forest"
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
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeAndRefocus = () => {
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    const onMouseDown = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest("[data-section-menu]")) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAndRefocus();
    };
    // Scrolling away closes it, so it cannot reappear open after the label hides
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  if (!present || !inSections) return null;
  const current = sections.find((section) => section.id === active);
  const currentLabel = current?.label ?? TOP.label;

  return (
    <div className="relative min-[1440px]:hidden" data-section-menu>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="section-jump-list"
        aria-label={`Current section: ${currentLabel}. Jump to a section`}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 items-center gap-2 px-2 text-[10px] uppercase tracking-widest text-ink/80 transition-colors hover:text-forest"
        style={MONO}
      >
        <span aria-hidden="true" className={`h-[7px] w-[7px] border ${MARK_ON}`} />
        {currentLabel}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <ul
          id="section-jump-list"
          className="absolute right-0 top-full mt-2 min-w-[11rem] border border-ink/15 bg-paper p-1"
          style={{ borderRadius: 2 }}
        >
          {[TOP, ...sections].map((section) => {
            const on = section.id === TOP.id ? active === null : active === section.id;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  aria-current={on ? "location" : undefined}
                  onClick={() => {
                    setOpen(false);
                    jump(section.id);
                    // Focusing scrolls by default, which would cancel the jump
                    trigger.current?.focus({ preventScroll: true });
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-[11px] uppercase tracking-widest transition-colors hover:bg-forest/7 ${
                    on ? "text-forest" : "text-ink/75"
                  }`}
                  style={MONO}
                >
                  <span aria-hidden="true" className={`h-[7px] w-[7px] border ${on ? MARK_ON : "border-ink/60"}`} />
                  {section.label}
                </button>
              </li>
            );
          })}
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
      className={`absolute bottom-0 left-0 h-0.5 transition-[width] duration-150 motion-reduce:transition-none min-[1440px]:hidden ${LINE}`}
      style={{ width: `${fill}%` }}
    />
  );
}
