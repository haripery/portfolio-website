"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MONO = { fontFamily: "var(--font-jetbrains-mono), monospace" };
const DISPLAY = { fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" };
const EASE = [0.2, 0.7, 0.2, 1] as const;

export type Area = "fullstack" | "ai" | "cloud";

// Each part of the T has one colour, used for its shape, its word in the
// headline and its skill chips. The text shades are darker in light mode so
// the words stay readable on the paper background.
export const AREAS: Record<
  Area,
  { label: string; short: string; note?: string; fill: string; line: string; text: string; skills: string[] }
> = {
  fullstack: {
    label: "Full stack, frontend-heavy",
    short: "Full stack",
    note: "Deepest in the browser: rendering, performance, real-time data and accessibility, with the services behind them.",
    fill: "bg-gold",
    line: "border-gold",
    text: "text-[#8A6A00] dark:text-gold",
    skills: [
      "React 18+",
      "TypeScript",
      "Next.js",
      "Web Workers",
      "WebSockets",
      "Web Vitals",
      "Accessibility (ARIA, WCAG)",
      "Design Systems",
      "Redux",
      "React Query",
      "Storybook",
      "Tailwind",
      "Node.js",
      "GraphQL",
      "REST",
      "Python",
      "FastAPI",
      "SQL",
      "Java",
      "Spring Boot",
      "Kafka",
      "Jest",
      "Cypress",
      "Playwright",
    ],
  },
  ai: {
    label: "Applied AI",
    short: "Applied AI",
    note: "Agents that query through allow-listed integrations and leave the decision with an engineer, evals that check answers are grounded, and interfaces that make a model's output something a person can check.",
    fill: "bg-coral",
    line: "border-coral",
    text: "text-[#C4502F] dark:text-coral",
    skills: [
      "Model Context Protocol (MCP)",
      "LangGraph",
      "Amazon Bedrock",
      "Human-in-the-Loop",
      "LLM Evaluation",
      "Claude (Anthropic API)",
      "OpenAI API",
      "Python",
      "Agentic Workflows",
      "RAG",
      "Knowledge Graphs (Neo4j)",
      "AG-UI",
      "A2UI",
      "A2A",
    ],
  },
  cloud: {
    label: "Cloud and observability",
    short: "Cloud",
    fill: "bg-[#2E9E6B] dark:bg-mint",
    line: "border-[#2E9E6B] dark:border-mint",
    text: "text-[#1F7A52] dark:text-mint",
    skills: [
      "AWS (CDK, CloudWatch, Lambda, S3, EC2)",
      "Infrastructure as Code",
      "Docker",
      "Kubernetes",
      "CI/CD (GitHub Actions, GitLab)",
      "Splunk",
      "Dynatrace",
      "Telemetry and SLIs",
      "On-call ownership",
    ],
  },
};

/**
 * The home page summary: a small T beside the headline. The stem is full
 * stack (frontend-heavy), the arms are applied AI and cloud. Pointing at a part (or its word)
 * swaps the summary for the skills behind it; clicking it marks the
 * matching highlights in the company tiles.
 */
export function TShape({
  identity,
  summary,
  facts,
  filter,
  onFilter,
  children,
}: {
  identity: React.ReactNode;
  summary: string;
  facts: string[];
  filter: Area | null;
  onFilter: (area: Area) => void;
  children?: React.ReactNode;
}) {
  const [preview, setPreview] = useState<Area | null>(null);
  const lit = preview ?? filter;

  // Touch screens have no hover, and a tap there should only open or close
  // the skills. Marking work in the tiles is a mouse-and-keyboard action,
  // so a stray tap while scrolling can't leave tiles highlighted.
  const isTouch = () => window.matchMedia("(hover: none)").matches;

  // Shared by the T's parts and the words in the headline
  const trigger = (area: Area) => ({
    type: "button" as const,
    "aria-pressed": filter === area,
    onMouseEnter: () => {
      if (!isTouch()) setPreview(area);
    },
    onFocus: () => {
      if (!isTouch()) setPreview(area);
    },
    onBlur: () => {
      if (!isTouch()) setPreview(null);
    },
    onClick: () => {
      if (isTouch()) setPreview((current) => (current === area ? null : area));
      else onFilter(area);
    },
  });

  const word = (area: Area, text: string) => (
    <button {...trigger(area)} className={`border-b-4 ${AREAS[area].text} ${AREAS[area].line}`}>
      {text}
    </button>
  );

  const dimmed = (area: Area) => lit !== null && lit !== area;

  return (
    <div onMouseLeave={() => setPreview(null)}>
      <div className="flex items-stretch gap-5 sm:gap-7">
        {/* The T — sized in em of the headline's type, and as tall as the headline block */}
        <div className="relative min-h-[2.4em] w-[2.3em] flex-shrink-0 text-2xl sm:text-4xl lg:text-5xl">
          <motion.button
            {...trigger("ai")}
            aria-label="Applied AI: show skills, click to mark matching work"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: dimmed("ai") ? 0.35 : 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`absolute left-0 top-0 h-[0.5em] w-1/2 origin-right ${AREAS.ai.fill} after:absolute after:-inset-x-1 after:-inset-y-2`}
          />
          <motion.button
            {...trigger("cloud")}
            aria-label="Cloud and observability: show skills, click to mark matching work"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: dimmed("cloud") ? 0.35 : 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`absolute right-0 top-0 h-[0.5em] w-1/2 origin-left ${AREAS.cloud.fill} after:absolute after:-inset-x-1 after:-inset-y-2`}
          />
          <motion.button
            {...trigger("fullstack")}
            aria-label="Full stack, frontend-heavy: show skills, click to mark matching work"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1, opacity: dimmed("fullstack") ? 0.35 : 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className={`absolute bottom-0 left-1/2 top-[0.5em] w-[0.6em] -translate-x-1/2 origin-top ${AREAS.fullstack.fill} after:absolute after:-inset-x-3 after:inset-y-0`}
          />
        </div>

        <div className="min-w-0">
          <div>{identity}</div>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-2 text-2xl font-bold leading-tight tracking-tight text-forest sm:text-4xl lg:text-5xl"
            style={DISPLAY}
          >
            {word("fullstack", "Full stack")}, all the way down.
            <br />
            {word("ai", "Applied AI")} and {word("cloud", "cloud")}, all the way across.
          </motion.h2>
        </div>
      </div>

      {/* One slot: the summary, or the skills behind the part being pointed at */}
      <div className="mt-6 min-h-20" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {preview ? (
            <motion.div
              key={preview}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.2 }}
            >
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink/60" style={MONO}>
                <span className={`h-2.5 w-2.5 ${AREAS[preview].fill}`} aria-hidden="true" />
                {AREAS[preview].label}
                <span className="hidden [@media(hover:hover)]:inline"> · click to mark this work below</span>
              </p>
              {AREAS[preview].note && (
                <p className="mt-2 max-w-2xl text-sm text-ink/70">{AREAS[preview].note}</p>
              )}
              <ul className="mt-3 flex flex-wrap gap-2">
                {AREAS[preview].skills.map((skill, index) => (
                  <motion.li
                    key={skill}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border bg-card px-2 py-0.5 text-[11px] text-forest ${AREAS[preview].line}`}
                    style={{ ...MONO, borderRadius: 2 }}
                  >
                    {skill}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              {summary && <p className="text-base leading-relaxed text-ink/75 sm:text-lg">{summary}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <ul
          className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] uppercase tracking-widest text-ink/60"
          style={MONO}
        >
          {facts.map((fact) => (
            <li key={fact} className="flex items-center gap-2">
              <span className="h-1 w-1 bg-coral" aria-hidden="true" />
              {fact}
            </li>
          ))}
        </ul>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
