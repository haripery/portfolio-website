"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";

const STATS = [
  { text: "76% of developers use or plan to use AI tools", source: "Stack Overflow 2024", href: "https://survey.stackoverflow.co/2024/ai" },
  { text: "97M+ monthly MCP SDK downloads", source: "Anthropic", href: "https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation" },
  { text: "20M+ monthly AI SDK downloads", source: "Vercel", href: "https://vercel.com/blog/ai-sdk-6" },
  { text: "25% drop in frontend-only job posts (2024-2025)", source: "LeadDev / TalentNeuron", href: "https://leaddev.com/ai/does-ai-spell-death-front-end-engineering" },
];

export function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % STATS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="mb-16 pt-4">
      <ScrollReveal>
        {/* Stat ticker */}
        <div className="relative h-6 w-full max-w-xl overflow-hidden mb-6">
          <AnimatePresence mode="wait">
            <motion.a
              key={index}
              href={STATS[index].href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 text-xs font-medium text-coral hover:text-coral/80 transition-colors"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              {STATS[index].text}
              <span className="text-ink/25 ml-2">- {STATS[index].source}</span>
            </motion.a>
          </AnimatePresence>
        </div>

        {/* Protocol badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["AG-UI", "A2A", "A2UI"].map((protocol, i) => (
            <motion.span
              key={protocol}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-xs font-mono px-3 py-1 rounded-full border border-ink/15 text-ink/60"
            >
              {protocol}
            </motion.span>
          ))}
        </div>

        {/* Animated diagram */}
        <div className="relative mb-8 py-8 px-6 rounded-xl border border-ink/15 bg-ink/[0.03] overflow-hidden">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative flex items-center justify-center gap-4 md:gap-8">
            {/* Agent nodes */}
            {[
              { icon: "📡", label: "Tracker", protocol: "A2A" },
              { icon: "🧠", label: "Profiler", protocol: "AG-UI" },
              { icon: "💡", label: "Advisor", protocol: "A2UI" },
            ].map((node, i) => (
              <div key={node.label} className="flex items-center gap-4 md:gap-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-ink/15 bg-card flex items-center justify-center text-2xl md:text-3xl shadow-sm">
                    {node.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-ink/60">
                    {node.label}
                  </span>
                  <span className="text-[8px] font-mono text-ink/30">
                    {node.protocol}
                  </span>
                </motion.div>

                {/* Connector */}
                {i < 2 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6 + i * 0.15 }}
                    className="hidden md:flex items-center"
                  >
                    <div className="w-12 h-px bg-ink/15 relative">
                      <motion.div
                        animate={{ x: [0, 48, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400/50"
                      />
                    </div>
                    <span className="text-ink/20 text-sm">→</span>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Intro text */}
        <div className="max-w-2xl">
          <p className="text-base text-ink/70 leading-relaxed mb-4">
            Three new protocols are defining how AI agents communicate with frontends, tools,
            and each other: <strong>AG-UI</strong> for agent-to-user streaming,{" "}
            <strong>A2A</strong> for agent-to-agent coordination, and{" "}
            <strong>A2UI</strong> for generative UI. Instead of just explaining them,
            I built a live demo that uses all three.
          </p>
          <p className="text-base text-ink/70 leading-relaxed">
            Below, three agents collaborate to analyze <em>your</em> browsing context,
            build a visitor persona, and generate personalized portfolio recommendations -
            with every protocol event visible in real-time.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
