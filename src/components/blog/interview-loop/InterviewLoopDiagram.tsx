"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";
import {
  type Level,
  type Stage,
  LEVEL_LABELS,
  RESOURCE_COLORS,
  pipelines,
} from "./data/pipelineData";

function StageCard({
  stage,
  isExpanded,
  onToggle,
}: {
  stage: Stage;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const resourceCount = stage.resources.length;

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-6 h-4 w-4 border-2 border-coral bg-paper"
        style={{ borderRadius: "2px" }}
      />

      <div className="border border-ink/15 bg-card p-5 transition-colors hover:border-coral/40">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none">{stage.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[10px] uppercase tracking-widest text-coral"
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                Step {stage.step}
              </span>
              {stage.optional && (
                <span className="border border-gold/30 bg-gold/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-gold">
                  Optional
                </span>
              )}
              <span
                className="ml-auto text-xs text-ink/45"
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                {stage.duration}
              </span>
            </div>
            <h4
              className="mt-1.5 text-base font-bold text-forest"
              style={{
                fontFamily:
                  "var(--font-space-grotesk), system-ui, sans-serif",
              }}
            >
              {stage.name}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              {stage.description}
            </p>
          </div>
        </div>

        {/* Expandable resources */}
        {resourceCount > 0 && (
          <div className="mt-4">
            <button
              onClick={onToggle}
              className="inline-flex items-center gap-1.5 text-xs text-coral transition-colors hover:text-coral/80"
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              {isExpanded ? "Hide" : "Show"} {resourceCount} Resource
              {resourceCount !== 1 ? "s" : ""}
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 pt-3">
                    {stage.resources.map((r) => (
                      <a
                        key={r.url}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 border px-2.5 py-1 text-xs transition-opacity hover:opacity-75 ${RESOURCE_COLORS[r.type]}`}
                        style={{ borderRadius: "2px" }}
                      >
                        {r.name}
                        <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export function InterviewLoopDiagram() {
  const [selectedLevel, setSelectedLevel] = useState<Level>("new-grad");
  const [expandedStages, setExpandedStages] = useState<Set<number>>(
    new Set()
  );

  const pipeline = pipelines[selectedLevel];

  function toggleStage(step: number) {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(step)) {
        next.delete(step);
      } else {
        next.add(step);
      }
      return next;
    });
  }

  function handleLevelChange(level: Level) {
    setSelectedLevel(level);
    setExpandedStages(new Set());
  }

  return (
    <ScrollReveal>
      <section id="interview-pipeline" className="mb-20 scroll-mt-24">
        {/* Section header */}
        <div className="mb-8">
          <p
            className="mb-2 text-xs uppercase tracking-widest text-coral"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            02. Interactive Guide
          </p>
          <h2
            className="text-2xl font-bold tracking-tight text-forest md:text-3xl"
            style={{
              fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
            }}
          >
            The Interview Pipeline
          </h2>
          <p className="mt-2 text-base leading-relaxed text-ink/60">
            Select your level to see a step-by-step breakdown of each
            interview stage, with curated preparation resources.
          </p>
        </div>

        {/* Level selector */}
        <div className="mb-8 flex flex-wrap gap-2">
          {(Object.keys(LEVEL_LABELS) as Level[]).map((level) => (
            <button
              key={level}
              onClick={() => handleLevelChange(level)}
              className={`border px-4 py-2 text-sm font-medium transition-colors ${
                selectedLevel === level
                  ? "border-coral bg-coral/10 text-forest"
                  : "border-ink/15 text-ink/55 hover:border-coral/40 hover:text-forest"
              }`}
              style={{
                fontFamily:
                  "var(--font-space-grotesk), system-ui, sans-serif",
                borderRadius: "2px",
              }}
            >
              {LEVEL_LABELS[level]}
            </button>
          ))}
        </div>

        {/* Timeline badge */}
        <div className="mb-6">
          <span
            className="inline-block border border-ink/15 bg-ink/[0.03] px-3 py-1.5 text-xs text-ink/55"
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              borderRadius: "2px",
            }}
          >
            Typical timeline: {pipeline.timeline}
          </span>
        </div>

        {/* Stage cards with timeline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLevel}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[7px] top-6 bottom-6 w-px border-l border-dashed border-ink/15" />

              <div className="space-y-4">
                {pipeline.stages.map((stage) => (
                  <StageCard
                    key={stage.step}
                    stage={stage}
                    isExpanded={expandedStages.has(stage.step)}
                    onToggle={() => toggleStage(stage.step)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </ScrollReveal>
  );
}
