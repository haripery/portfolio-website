"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const STATS = [
  "97.8% of Fortune 500 use AI to screen your résumé",
  "75% of résumés rejected before a human sees them",
  "222 applications per job opening",
  "0.1% cold application success rate",
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
    <section
      id="hero"
      className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center scroll-mt-24"
    >
      {/* Subtle animated grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "ai-hiring-grid 4s linear infinite",
        }}
      />

      {/* Stat ticker */}
      <div className="relative mb-8 h-8 w-full max-w-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 text-sm font-medium text-coral"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {STATS[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Title */}
      <h2
        className="mb-4 text-4xl font-bold tracking-tight text-forest md:text-5xl lg:text-6xl"
        style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
      >
        The AI Hiring Revolution
      </h2>

      {/* Subtitle */}
      <p className="mb-2 max-w-2xl text-base text-ink/60 leading-relaxed md:text-lg">
        A data-driven survival guide for CS students entering the 2026 job market
      </p>

      {/* Badges */}
      <div className="mt-4 flex items-center gap-4">
        <span
          className="inline-block border border-ink/15 px-3 py-1 text-xs text-ink/50"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          18 min read
        </span>
        <span
          className="inline-block border border-ink/15 px-3 py-1 text-xs text-ink/50"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          47 data points
        </span>
      </div>

      {/* Scroll indicator */}
      <div
        className="mt-12 flex flex-col items-center gap-1 text-ink/40"
        style={{ animation: "ai-hiring-scroll-hint 2s ease-in-out infinite" }}
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll to explore</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </section>
  );
}
