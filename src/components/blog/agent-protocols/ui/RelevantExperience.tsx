"use client";

import { motion } from "framer-motion";
import type { RelevantExperienceProps } from "@/lib/protocols/a2ui";

export function RelevantExperience({ experiences }: RelevantExperienceProps) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-ink/50 uppercase tracking-wider mb-3">
        Relevant Experience
      </h4>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-3 bottom-3 w-px bg-ink/10" />

        <div className="space-y-4">
          {experiences.map((exp, i) => (
            <motion.div
              key={`${exp.company}-${exp.role}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.15 }}
              className="relative pl-6"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-2 w-[15px] h-[15px] rounded-full border-2 border-ink/20 bg-card" />

              <div className="rounded-lg border border-ink/15 bg-ink/[0.04] p-4">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h5 className="font-semibold text-ink">{exp.role}</h5>
                  <span className="text-xs text-ink/40 font-mono shrink-0">
                    {exp.period}
                  </span>
                </div>
                <p className="text-sm text-ink/60 mb-2">{exp.company}</p>

                {exp.highlights.length > 0 && (
                  <ul className="text-sm text-ink/70 space-y-1 mb-2">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-ink/30 shrink-0">&bull;</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                  {exp.relevance}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
