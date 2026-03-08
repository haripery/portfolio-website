"use client";

import { motion } from "framer-motion";
import type { RecommendedProjectsProps } from "@/lib/protocols/a2ui";

export function RecommendedProjects({ projects }: RecommendedProjectsProps) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-ink/50 uppercase tracking-wider mb-3">
        Recommended Projects
      </h4>
      <div className="grid gap-3">
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="rounded-lg border border-ink/15 bg-ink/[0.04] p-4 hover:border-ink/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-ink mb-1">{project.title}</h5>
                <p className="text-sm text-ink/60 mb-2 line-clamp-2">
                  {project.description}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 italic">
                  {project.relevance}
                </p>
              </div>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs px-2.5 py-1 rounded border border-ink/15 text-ink/60 hover:text-ink hover:border-ink/30 transition-colors"
                >
                  View &rarr;
                </a>
              )}
            </div>
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-ink/8 text-ink/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
