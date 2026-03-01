"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const STATS = [
  "43% of organizations now use AI in hiring",
  "1 in 3 companies say AI will fully run hiring by 2027",
  "81% of Big Tech interviewers suspected AI cheating",
  "Mercor went from $0 to $10B valuation in under a year",
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
      className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center scroll-mt-24"
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
        className="mb-4 text-3xl font-bold tracking-tight text-forest sm:text-4xl md:text-5xl"
        style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
      >
        AI Is the Next Interview
      </h2>

      {/* Subtitle */}
      <p className="mb-2 max-w-xl text-base text-ink/60 leading-relaxed md:text-lg">
        How Shopify, Canva & others are rewriting the hiring playbook
      </p>

      {/* Badges */}
      <div className="mt-4 flex items-center gap-4">
        <span
          className="inline-block border border-ink/15 px-3 py-1 text-xs text-ink/50"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          12 min read
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
