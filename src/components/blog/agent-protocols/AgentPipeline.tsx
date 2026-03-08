"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  activeAgent: string | null;
  phase: string | null;
  completedAgents: string[];
}

const AGENTS = [
  { name: "Tracker Agent", icon: "📡", description: "Signal collection" },
  { name: "Profiler Agent", icon: "🧠", description: "AI classification" },
  { name: "Advisor Agent", icon: "💡", description: "Recommendations" },
];

export function AgentPipeline({ activeAgent, phase, completedAgents }: Props) {
  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold text-ink/40 uppercase tracking-wider mb-3">
        Agent Pipeline (A2A)
      </h4>
      <div className="flex items-center gap-2">
        {AGENTS.map((agent, i) => {
          const isActive = activeAgent === agent.name;
          const isCompleted = completedAgents.includes(agent.name);
          const isPending = !isActive && !isCompleted;

          return (
            <div key={agent.name} className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: isActive ? 1.05 : 1,
                }}
                className={`relative flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-2 min-w-[100px] transition-colors ${
                  isActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : isCompleted
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-ink/15 bg-ink/[0.02]"
                }`}
              >
                {/* Pulse ring for active agent */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0.3, 0], scale: [1, 1.5] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute inset-0 rounded-lg border-2 border-blue-400"
                    />
                  )}
                </AnimatePresence>

                <span className="text-xl">{agent.icon}</span>
                <span className="text-[10px] font-semibold text-ink/70 text-center leading-tight">
                  {agent.name}
                </span>
                <span className="text-[9px] text-ink/40">
                  {isActive
                    ? phase ?? "working"
                    : isCompleted
                    ? "done"
                    : isPending
                    ? "waiting"
                    : ""}
                </span>

                {/* Status indicator */}
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                    isActive
                      ? "bg-blue-500"
                      : isCompleted
                      ? "bg-emerald-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              </motion.div>

              {/* Arrow connector */}
              {i < AGENTS.length - 1 && (
                <span
                  className={`text-lg font-light ${
                    isCompleted ? "text-emerald-500" : "text-ink/20"
                  }`}
                >
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
