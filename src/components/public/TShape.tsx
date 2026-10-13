"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import posthog from "posthog-js";

const MONO = { fontFamily: "var(--font-jetbrains-mono), monospace" };
const DISPLAY = { fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" };
const EASE = [0.2, 0.7, 0.2, 1] as const;

type Area = "frontend" | "ai" | "fullstack";

const AREAS: Record<Area, { label: string; fill: string; line: string; skills: string[] }> = {
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
 * The home heading: a sentence beside a small T. The stem is frontend, the
 * two arms are applied AI and full stack. Pointing at a part, or at its word
 * in the sentence, lists the skills behind it.
 */
export function TShape() {
  const [active, setActive] = useState<Area | null>(null);

  function show(area: Area) {
    if (area === active) return;
    setActive(area);
    posthog.capture("t_shape_area_viewed", { area });
  }

  // Shared by the T's parts and the words in the sentence
  const trigger = (area: Area) => ({
    type: "button" as const,
    "aria-pressed": active === area,
    onMouseEnter: () => show(area),
    onFocus: () => show(area),
    onClick: () => show(area),
  });

  const word = (area: Area, text: string) => (
    <button
      {...trigger(area)}
      className={`border-b-4 transition-colors ${AREAS[area].line} ${
        active === area ? "text-forest" : "text-forest/90 hover:text-forest"
      }`}
    >
      {text}
    </button>
  );

  const dimmed = (area: Area) => active !== null && active !== area;

  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-start gap-5 sm:gap-7">
        {/* The T */}
        <div className="relative mt-1 h-[84px] w-[72px] flex-shrink-0 sm:h-[104px] sm:w-[88px]">
          <motion.button
            {...trigger("ai")}
            aria-label="Applied AI skills"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: dimmed("ai") ? 0.35 : 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`absolute left-0 top-0 h-[16px] w-1/2 origin-right ${AREAS.ai.fill} after:absolute after:-inset-x-1 after:-inset-y-2 sm:h-[20px]`}
          />
          <motion.button
            {...trigger("fullstack")}
            aria-label="Full stack skills"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, opacity: dimmed("fullstack") ? 0.35 : 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`absolute right-0 top-0 h-[16px] w-1/2 origin-left ${AREAS.fullstack.fill} after:absolute after:-inset-x-1 after:-inset-y-2 sm:h-[20px]`}
          />
          <motion.button
            {...trigger("frontend")}
            aria-label="Frontend skills"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1, opacity: dimmed("frontend") ? 0.35 : 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className={`absolute left-1/2 top-[16px] h-[68px] w-[18px] -translate-x-1/2 origin-top ${AREAS.frontend.fill} after:absolute after:-inset-x-3 after:inset-y-0 sm:top-[20px] sm:h-[84px] sm:w-[22px]`}
          />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold leading-tight tracking-tight text-forest sm:text-4xl"
          style={DISPLAY}
        >
          {word("frontend", "Frontend")}, all the way down.
          <br />
          {word("ai", "AI")} and {word("fullstack", "full stack")}, all the way across.
        </motion.h2>
      </div>

      {/* Skills behind the part being pointed at */}
      <div className="mt-6 min-h-24" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {active ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink/60" style={MONO}>
                <span className={`h-2.5 w-2.5 ${AREAS[active].fill}`} aria-hidden="true" />
                {AREAS[active].label}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {AREAS[active].skills.map((skill, index) => (
                  <motion.li
                    key={skill}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.025 }}
                    className={`border bg-card px-2 py-0.5 text-[11px] text-forest ${AREAS[active].line}`}
                    style={{ ...MONO, borderRadius: 2 }}
                  >
                    {skill}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="text-[11px] uppercase tracking-widest text-ink/50"
              style={MONO}
            >
              Point at a part of the T to see the skills behind it
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
