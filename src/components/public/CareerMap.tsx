"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { LayoutGroup, MotionConfig, motion } from "framer-motion";
import posthog from "posthog-js";
import type { ExperienceWithRelations } from "@/types";
import { HighlightViz } from "./HighlightViz";
import { AREAS, TShape, type Area } from "./TShape";
import { HighlightIcon } from "./highlightIcons";
import { ArrowLeft, ArrowRight, X, ZoomIn } from "lucide-react";

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

// The tiles fade in once per page load, not every time you zoom back out
let overviewShown = false;

function CardIcon({ name }: { name: string }) {
  return (
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-forest/30 bg-forest/7 text-forest">
      <HighlightIcon name={name} className="h-5 w-5" />
    </span>
  );
}

export function CareerMap({
  experiences,
  name,
  identity,
  summary,
  facts,
  socials,
  children,
}: {
  experiences: ExperienceWithRelations[];
  /** Root breadcrumb label */
  name: string;
  /** Name and title line shown above the headline */
  identity: React.ReactNode;
  summary: string;
  facts: string[];
  socials?: React.ReactNode;
  /** Sections shown under the companies on the landing level */
  children?: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Area | null>(null);
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
  }, []);

  // Each zoom level keeps its own scroll position: a level seen before is
  // restored to where it was left, a new one starts at the top of the map.
  const positions = useRef(new Map<string, number>());
  const firstRender = useRef(true);
  useEffect(() => {
    const remember = () => positions.current.set(window.location.search, window.scrollY);
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, []);
  useEffect(() => {
    overviewShown = true;
  }, []);
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const saved = positions.current.get(search);
    // 80px clears the fixed top nav. "instant" because the page scrolls
    // smoothly by default, and a smooth scroll is dropped when the page
    // height changes underneath it.
    const top =
      saved ?? (rootRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  }, [search]);

  const selectArea = useCallback((area: Area | null) => {
    setFilter((current) => (current === area ? null : area));
    posthog.capture("career_map_filtered", { area: area ?? "all" });
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
          {/* Breadcrumb — only once zoomed in */}
          {company && (
            <nav
              aria-label="Zoom level"
              className="-ml-2 flex min-h-11 flex-wrap items-center gap-1 text-[11px] uppercase tracking-widest text-ink/55"
              style={MONO}
            >
              <button type="button" onClick={() => navigate()} className={crumb}>
                {name}
              </button>
              <span aria-hidden="true">/</span>
              {highlight ? (
                <button type="button" onClick={() => navigate(company.company)} className={crumb}>
                  {company.company}
                </button>
              ) : (
                <span className="px-2 py-3">{company.company}</span>
              )}
              {highlight && (
                <>
                  <span aria-hidden="true" className="hidden sm:inline">/</span>
                  <span className="hidden px-2 py-3 normal-case tracking-normal sm:inline">{highlight.title}</span>
                </>
              )}
            </nav>
          )}

          {/* Level 1 — summary, companies, every highlight */}
          {!company && (
            <div>
              <TShape
                identity={identity}
                summary={summary}
                facts={facts}
                filter={filter}
                onFilter={selectArea}
              >
                {socials}
              </TShape>

              <SectionHeading label="Experience" hint="Pick a company to zoom in, or jump straight to a highlight">
                {filter && (
                  <button
                    type="button"
                    onClick={() => selectArea(null)}
                    className="flex items-center gap-2 border border-ink/20 px-2 py-1 text-[11px] uppercase tracking-widest text-forest transition-colors hover:border-forest"
                    style={{ ...MONO, borderRadius: 2 }}
                  >
                    <span className={`h-2.5 w-2.5 ${AREAS[filter].fill}`} aria-hidden="true" />
                    {AREAS[filter].label} work marked
                    <X className="h-3 w-3" aria-label="Clear" />
                  </button>
                )}
              </SectionHeading>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {experiences.map((exp, index) => {
                  const lead = index === 0;
                  const soft = lead ? "text-paper/70" : "text-ink/55";
                  return (
                    <li key={exp.id}>
                      <motion.div
                        layoutId={`company-${exp.id}`}
                        initial={overviewShown ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={overviewShown ? undefined : { delay: 0.25 + index * 0.07 }}
                        className={`flex h-full flex-col border ${
                          lead ? "border-forest bg-forest text-paper" : "border-ink/15 bg-card text-forest"
                        }`}
                        style={{ borderRadius: 2 }}
                      >
                        <button
                          type="button"
                          onClick={() => navigate(exp.company)}
                          className="group block w-full p-6 pb-4 text-left"
                        >
                          <span className={`flex items-center justify-between text-[10px] uppercase tracking-widest ${soft}`} style={MONO}>
                            {exp.period}
                            <ZoomIn className="h-4 w-4 transition-transform group-hover:scale-125" aria-hidden="true" />
                          </span>
                          <span
                            className="mt-2 block text-2xl font-bold leading-tight underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-gold"
                            style={DISPLAY}
                          >
                            {exp.company}
                          </span>
                          <span className={`block text-sm ${lead ? "text-paper/75" : "text-ink/60"}`}>{exp.title}</span>
                          {exp.headline && (
                            <span className="mt-4 block text-base font-medium leading-snug">{exp.headline}</span>
                          )}
                        </button>
                        {exp.highlights.length > 0 && (
                          <ul
                            className={`mt-auto divide-y border-t ${
                              lead ? "divide-paper/15 border-paper/20" : "divide-ink/10 border-ink/10"
                            }`}
                          >
                            {exp.highlights.map((item) => {
                              const match = filter !== null && item.areas.split(",").includes(filter);
                              return (
                              <li key={item.id}>
                                <button
                                  type="button"
                                  onClick={() => navigate(exp.company, item.title)}
                                  className={`flex min-h-14 w-full items-center gap-3 px-6 py-3 text-left text-[15px] transition-[background-color,opacity] duration-300 sm:min-h-11 sm:py-2.5 sm:text-sm ${
                                    lead ? "hover:bg-paper/10" : "hover:bg-forest/7"
                                  } ${match ? "bg-gold/25 font-semibold" : ""} ${filter !== null && !match ? "opacity-35" : ""}`}
                                >
                                  <HighlightIcon name={item.icon} className={`h-4 w-4 flex-shrink-0 ${lead ? "text-paper/70" : "text-ink/60"}`} />
                                  <span className="min-w-0 flex-1 leading-snug">{item.title}</span>
                                  <ArrowRight className={`h-3.5 w-3.5 flex-shrink-0 ${soft}`} aria-hidden="true" />
                                </button>
                              </li>
                              );
                            })}
                          </ul>
                        )}
                      </motion.div>
                    </li>
                  );
                })}
              </ul>

              {children && <div>{children}</div>}
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
                  {company.company}
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

export function SectionHeading({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink/15 pt-5">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-forest" style={DISPLAY}>
        {label}
      </h2>
      {hint && (
        <p className="text-[11px] text-ink/55" style={MONO}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}
