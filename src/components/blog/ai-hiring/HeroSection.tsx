"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATS = [
  "43% of organizations now use AI in hiring",
  "1 in 3 companies say AI will fully run hiring by 2026",
  "81% of Big Tech interviewers suspected AI cheating",
  "Mercor went from $2B to $10B valuation in eight months",
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
      className="relative flex flex-col items-center justify-center px-4 py-10 text-center scroll-mt-24"
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
      <div className="relative h-8 w-full max-w-xl overflow-hidden">
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
    </section>
  );
}
