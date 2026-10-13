"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { LayoutGroup, MotionConfig, motion } from "framer-motion";
import posthog from "posthog-js";
import type { ExperienceWithRelations } from "@/types";
import { HighlightViz } from "./HighlightViz";
import { TShape } from "./TShape";
import { HighlightIcon } from "./highlightIcons";
import { ArrowLeft, ArrowRight, ZoomIn } from "lucide-react";

const MONO = { fontFamily: "var(--font-jetbrains-mono), monospace" };
const DISPLAY = { fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" };
const NAV_EVENT = "careermap:navigate";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// The zoom level lives in the URL (?c=company&h=highlight) so Back zooms out
// and any level can be linked to directly.
function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(NAV_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(NAV_EVENT, onChange);
  };
}
const getSearch = () => window.location.search;
const getServerSearch = () => "";

function CardIcon({ name }: { name: string }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center border border-forest/30 bg-forest/7 text-forest">
      <HighlightIcon name={name} className="h-5 w-5" />
    </span>
  );
}

export function CareerMap({
  experiences,
}: {
  experiences: ExperienceWithRelations[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const params = new URLSearchParams(search);

  const company =
    experiences.find((exp) => slugify(exp.company) === params.get("c")) ?? null;
  const highlightIndex = company
    ? company.highlights.findIndex((h) => slugify(h.title) === params.get("h"))
    : -1;
  const highlight = company && highlightIndex >= 0 ? company.highlights[highlightIndex] : null;

  const navigate = useCallback((c?: string, h?: string) => {
    const next = new URLSearchParams();
    if (c) next.set("c", slugify(c));
    if (c && h) next.set("h", slugify(h));
    const query = next.toString();
    window.history.pushState(null, "", query ? `?${query}` : window.location.pathname);
    window.dispatchEvent(new Event(NAV_EVENT));
    posthog.capture("career_map_zoomed", { company: c ?? null, highlight: h ?? null });

    // Keep the map in view when a taller level is replaced by a shorter one
    const top = rootRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) rootRef.current?.scrollIntoView({ block: "start" });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (highlight && company) navigate(company.company);
      else if (company) navigate();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [company, highlight, navigate]);

  const crumb =
    "px-2 py-3 text-[11px] uppercase tracking-widest text-forest underline underline-offset-4 transition-colors hover:text-coral";

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 32 }}>
      <LayoutGroup>
        <div ref={rootRef} className="scroll-mt-20">
          <nav
            aria-label="Zoom level"
            className="-ml-2 flex min-h-11 flex-wrap items-center gap-1 text-[11px] uppercase tracking-widest text-ink/55"
            style={MONO}
          >
            {company ? (
              <button type="button" onClick={() => navigate()} className={crumb}>
                Career
              </button>
            ) : (
              <span className="px-2 py-3">Career</span>
            )}
            {company && (
              <>
                <span aria-hidden="true">/</span>
                {highlight ? (
                  <button type="button" onClick={() => navigate(company.company)} className={crumb}>
                    {company.company}
                  </button>
                ) : (
                  <span className="px-2 py-3">{company.company}</span>
                )}
              </>
            )}
            {highlight && (
              <>
                <span aria-hidden="true" className="hidden sm:inline">/</span>
                <span className="hidden px-2 py-3 normal-case tracking-normal sm:inline">{highlight.title}</span>
              </>
            )}
          </nav>

          {/* Level 1 — the whole career */}
          {!company && (
            <div>
              <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between sm:gap-12">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <h2
                    className="text-4xl font-bold leading-none tracking-tight text-forest sm:text-5xl"
                    style={DISPLAY}
                  >
                    T-shaped engineer.
                  </h2>
                  <p className="mt-4 max-w-md text-lg leading-snug text-ink/75">
                    Deep in frontend. Broad across full stack and applied AI.
                  </p>
                  <p
                    className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink/60"
                    style={MONO}
                  >
                    <ZoomIn className="h-4 w-4" aria-hidden="true" />
                    Pick a chapter to zoom in
                  </p>
                </motion.div>
                <TShape />
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {experiences.map((exp, index) => {
                  const lead = index === 0;
                  const zoomable = exp.highlights.length > 0;
                  const Tile = zoomable ? motion.button : motion.div;
                  return (
                    <li key={exp.id} className={lead ? "sm:col-span-2 lg:col-span-1" : undefined}>
                      <Tile
                        layoutId={`company-${exp.id}`}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + index * 0.07 }}
                        whileHover={zoomable ? { y: -4 } : undefined}
                        {...(zoomable
                          ? { type: "button" as const, onClick: () => navigate(exp.company) }
                          : {})}
                        className={`flex h-full min-h-52 w-full flex-col justify-between gap-5 border p-6 text-left transition-colors ${
                          lead
                            ? "border-forest bg-forest text-paper"
                            : "border-ink/15 bg-card text-forest hover:border-gold"
                        }`}
                        style={{ borderRadius: 2 }}
                      >
                        <span className="block">
                          <span
                            className={`block text-[10px] uppercase tracking-widest ${lead ? "text-paper/70" : "text-ink/55"}`}
                            style={MONO}
                          >
                            {exp.period}
                          </span>
                          <span className="mt-2 block text-2xl font-bold leading-tight" style={DISPLAY}>
                            {exp.company}
                          </span>
                          <span className={`block text-sm ${lead ? "text-paper/75" : "text-ink/60"}`}>
                            {exp.title}
                          </span>
                        </span>
                        <span className="block">
                          {exp.headline && (
                            <span className="block text-base font-medium leading-snug">{exp.headline}</span>
                          )}
                          {zoomable && (
                            <span
                              className={`mt-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest ${lead ? "text-gold" : "text-ink/60"}`}
                              style={MONO}
                            >
                              <span className="flex items-center gap-2" aria-hidden="true">
                                {exp.highlights.map((item) => (
                                  <HighlightIcon key={item.id} name={item.icon} className="h-4 w-4" />
                                ))}
                              </span>
                              <span>{exp.highlights.length} highlights +</span>
                            </span>
                          )}
                        </span>
                      </Tile>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Level 2 — one company */}
          {company && !highlight && (
            <div>
              <motion.div
                layoutId={`company-${company.id}`}
                className="mt-2 border border-forest bg-forest p-6 text-paper sm:p-10"
                style={{ borderRadius: 2 }}
              >
                <p className="text-[11px] uppercase tracking-widest text-gold" style={MONO}>
                  {company.period}
                </p>
                <h2 className="mt-2 text-4xl font-bold leading-none tracking-tight sm:text-5xl" style={DISPLAY}>
                  {company.company}
                </h2>
                <p className="mt-2 text-base text-paper/80">{company.title}</p>
                {company.headline && (
                  <p className="mt-5 max-w-2xl text-lg font-medium leading-snug">{company.headline}</p>
                )}
              </motion.div>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {company.highlights.map((item, index) => (
                  <li key={item.id}>
                    <motion.button
                      type="button"
                      layoutId={`highlight-${item.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.08 + index * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(company.company, item.title)}
                      className="flex h-full min-h-36 w-full flex-col justify-between gap-4 border border-ink/15 bg-card p-6 text-left transition-colors hover:border-gold"
                      style={{ borderRadius: 2 }}
                    >
                      <span className="block">
                        <CardIcon name={item.icon} />
                        {item.kind && (
                          <span className="mt-4 block text-[10px] uppercase tracking-widest text-ink/55" style={MONO}>
                            {item.kind}
                          </span>
                        )}
                        <span className="mt-2 block text-xl font-bold leading-tight text-forest" style={DISPLAY}>
                          {item.title}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-ink/60" style={MONO}>
                        <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                        Details
                      </span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Level 3 — one highlight */}
          {company && highlight && (
            <div>
              <motion.article
                layoutId={`highlight-${highlight.id}`}
                className="mt-2 border border-gold bg-card p-6 sm:p-12"
                style={{ borderRadius: 2 }}
              >
                <CardIcon name={highlight.icon} />
                <p className="mt-5 text-[11px] uppercase tracking-widest text-ink/55" style={MONO}>
                  {company.company}
                  {highlight.kind ? ` · ${highlight.kind}` : ""}
                </p>
                <h2
                  className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-forest sm:text-4xl"
                  style={DISPLAY}
                >
                  {highlight.title}
                </h2>
                {highlight.viz && (
                  <div key={highlight.id} className="mt-8 border-y border-ink/12 py-8">
                    <HighlightViz spec={highlight.viz} />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-ink/80 sm:text-lg"
                >
                  {highlight.detail.split(/\n{2,}/).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </motion.div>
              </motion.article>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] uppercase tracking-widest" style={MONO}>
                <button
                  type="button"
                  onClick={() => navigate(company.company)}
                  className="min-h-11 border border-forest px-4 py-3 text-forest transition-colors hover:bg-forest hover:text-paper"
                >
                  <ArrowLeft className="mr-2 inline h-3.5 w-3.5" aria-hidden="true" />
                  Zoom out
                </button>
                {company.highlights.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        company.company,
                        company.highlights[(highlightIndex + 1) % company.highlights.length].title
                      )
                    }
                    className="min-h-11 border border-forest bg-forest px-4 py-3 text-paper transition-colors hover:bg-forest/85"
                  >
                    Next highlight
                    <ArrowRight className="ml-2 inline h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
