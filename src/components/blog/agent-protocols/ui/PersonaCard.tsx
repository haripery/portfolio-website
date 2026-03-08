"use client";

import { motion } from "framer-motion";
import type { PersonaCardProps } from "@/lib/protocols/a2ui";

const PERSONA_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  recruiter: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300" },
  developer: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300" },
  student: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", text: "text-purple-700 dark:text-purple-300" },
  "hiring-manager": { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300" },
  "curious-visitor": { bg: "bg-gray-50 dark:bg-gray-950/30", border: "border-gray-200 dark:border-gray-800", text: "text-gray-700 dark:text-gray-300" },
};

export function PersonaCard({ type, confidence, traits, reasoning, emoji }: PersonaCardProps) {
  const colors = PERSONA_COLORS[type] ?? PERSONA_COLORS["curious-visitor"];
  const label = type.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`rounded-lg border ${colors.border} ${colors.bg} p-5 mb-4`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h4 className={`font-semibold text-lg ${colors.text}`}>{label}</h4>
          <p className="text-sm text-[var(--ink)]/50">Visitor Persona</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--ink)]/60">Confidence</span>
          <span className={`font-mono font-semibold ${colors.text}`}>{confidence}%</span>
        </div>
        <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className={`h-full rounded-full ${
              type === "recruiter" ? "bg-blue-500" :
              type === "developer" ? "bg-emerald-500" :
              type === "student" ? "bg-purple-500" :
              type === "hiring-manager" ? "bg-amber-500" :
              "bg-gray-500"
            }`}
          />
        </div>
      </div>

      {/* Traits */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {traits.map((trait) => (
          <span
            key={trait}
            className={`text-xs px-2 py-0.5 rounded-full border ${colors.border} ${colors.text}`}
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Reasoning */}
      <p className="text-sm text-[var(--ink)]/70 italic">"{reasoning}"</p>
    </motion.div>
  );
}
