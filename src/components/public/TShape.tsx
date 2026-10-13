"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MONO = { fontFamily: "var(--font-jetbrains-mono), monospace" };
const DISPLAY = { fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" };
const EASE = [0.2, 0.7, 0.2, 1] as const;

export type Area = "frontend" | "ai" | "fullstack";

export const AREAS: Record<Area, { label: string; fill: string; line: string; skills: string[] }> = {
  frontend: {
    label: "Frontend",
    fill: "bg-gold",
    line: "border-gold",
    skills: [
      "React 18+",
      "TypeScript",
      "JavaScript (ES6+)",
      "Next.js",
      "Design Systems",
      "Accessibility (ARIA, WCAG)",
      "Web Vitals",
      "Redux",
      "React Query",
      "RxJS",
      "Storybook",
      "Tailwind",
      "SCSS",
      "Jest",
      "Cypress",
      "Playwright",
      "React Testing Library",
    ],
  },
  ai: {
    label: "Applied AI",
    fill: "bg-coral",
    line: "border-coral",
    skills: [
      "LangGraph",
      "Amazon Bedrock",
      "Model Context Protocol (MCP)",
      "AG-UI",
      "A2UI",
      "A2A",
      "Agentic Workflows",
      "RAG",
      "Knowledge Graphs (Neo4j)",
      "LLM Evaluation",
      "Human-in-the-Loop",
      "Anthropic & OpenAI APIs",
    ],
  },
  fullstack: {
    label: "Full stack",
    fill: "bg-forest",
    line: "border-forest",
    skills: [
      "Node.js",
      "Python",
      "FastAPI",
      "GraphQL",
      "REST",
      "Java",
      "Spring Boot",
      "SQL",
      "Kafka",
      "WebSockets",
      "AWS (CDK, CloudWatch, Lambda, S3, EC2)",
      "Docker",
      "Kubernetes",
      "CI/CD",
    ],
  },
};

/**
 * The home page summary: a small T beside the headline. The stem is frontend,
 * the arms are applied AI and full stack. Pointing at a part (or its word)
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

  // Shared by the T's parts and the words in the headline
  const trigger = (area: Area) => ({
    type: "button" as const,
    "aria-pressed": filter === area,
    onMouseEnter: () => setPreview(area),
    onFocus: () => setPreview(area),
    onBlur: () => setPreview(null),
    onClick: () => onFilter(area),
  });

  const word = (area: Area, text: string) => (
    <button {...trigger(area)} className={`border-b-4 text-forest ${AREAS[area].line}`}>
      {text}
    </button>
  );

  const dimmed = (area: Area) => lit !== null && lit !== area;

  return (
    <div onMouseLeave={() => setPreview(null)}>
      <div className="flex items-stretch gap-5 sm:gap-7">
        {/* The T — sized in em of the headline's type, and as tall as the headline block */}
        <div className="relative min-h-[2.4em] w-[2.3em] flex-shrink-0 text-2xl sm:text-4xl">
          <motion.button
            {...trigger("ai")}
            aria-label="Applied AI: show skills, click to mark matching work"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: dimmed("ai") ? 0.35 : 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`absolute left-0 top-0 h-[0.5em] w-1/2 origin-right ${AREAS.ai.fill} after:absolute after:-inset-x-1 after:-inset-y-2`}
          />
          <motion.button
            {...trigger("fullstack")}
            aria-label="Full stack: show skills, click to mark matching work"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: dimmed("fullstack") ? 0.35 : 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`absolute right-0 top-0 h-[0.5em] w-1/2 origin-left ${AREAS.fullstack.fill} after:absolute after:-inset-x-1 after:-inset-y-2`}
          />
          <motion.button
            {...trigger("frontend")}
            aria-label="Frontend: show skills, click to mark matching work"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1, opacity: dimmed("frontend") ? 0.35 : 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className={`absolute bottom-0 left-1/2 top-[0.5em] w-[0.6em] -translate-x-1/2 origin-top ${AREAS.frontend.fill} after:absolute after:-inset-x-3 after:inset-y-0`}
          />
        </div>

        <div className="min-w-0">
          <div>{identity}</div>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-2 text-2xl font-bold leading-tight tracking-tight text-forest sm:text-4xl"
            style={DISPLAY}
          >
            {word("frontend", "Frontend")}, all the way down.
            <br />
            {word("ai", "AI")} and {word("fullstack", "full stack")}, all the way across.
          </motion.h2>
        </div>
      </div>

      {/* One slot: the summary, or the skills behind the part being pointed at */}
      <div className="mt-6 min-h-28 max-w-3xl" aria-live="polite">
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
                {AREAS[preview].label} · click to mark this work below
              </p>
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
              <ul
                className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] uppercase tracking-widest text-ink/60"
                style={MONO}
              >
                {facts.map((fact) => (
                  <li key={fact} className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-coral" aria-hidden="true" />
                    {fact}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {children}
    </div>
  );
}
