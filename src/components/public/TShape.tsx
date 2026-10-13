"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const MONO = { fontFamily: "var(--font-jetbrains-mono), monospace" };
const DISPLAY = { fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" };
const EASE = [0.2, 0.7, 0.2, 1] as const;
const DEPTH = ["React", "TypeScript", "Design systems", "Performance", "Accessibility"];

/**
 * The home heading, set as a T: three disciplines across the bar, with
 * frontend at the centre and its depth running down the stem.
 */
export function TShape() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setActive((i) => (i + 1) % DEPTH.length), 1400);
    return () => clearInterval(id);
  }, [reduce]);

  const word = "text-xl font-bold leading-none tracking-tight text-forest sm:text-4xl";

  return (
    <div className="w-full max-w-2xl">
      <h2 className="grid grid-cols-[1fr_auto_1fr] items-end gap-x-3 sm:gap-x-6" style={DISPLAY}>
        <motion.span
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
          className={`${word} text-right`}
        >
          Applied AI
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className={word}
        >
          Frontend
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
          className={word}
        >
          Full stack
        </motion.span>
        <span className="sr-only">: broad across applied AI and full stack, deepest in frontend.</span>
      </h2>

      {/* Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
        className="mt-3 h-[3px] origin-center bg-forest"
        aria-hidden="true"
      />

      {/* Stem */}
      <div className="flex flex-col items-center" aria-hidden="true">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3, delay: 0.8, ease: EASE }}
          className="h-3 w-[3px] origin-top bg-forest"
        />
        <ul className="text-center text-[11px] uppercase tracking-widest" style={MONO}>
          {DEPTH.map((label, index) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + index * 0.12 }}
              className="py-[3px]"
            >
              <span
                className={`px-2 py-0.5 transition-colors duration-500 ${
                  !reduce && index === active ? "bg-gold/50 text-forest" : "text-ink/65"
                }`}
              >
                {label}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
