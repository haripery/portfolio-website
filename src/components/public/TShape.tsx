"use client";

import { motion } from "framer-motion";

const MONO = { fontFamily: "var(--font-jetbrains-mono), monospace" };
const DEPTH = ["React", "TypeScript", "Design systems", "Performance", "Accessibility"];

/**
 * The "T-shaped engineer" mark: a broad bar (applied AI, full stack) on a
 * deep stem (frontend). Draws itself once, then a marker keeps travelling
 * down the stem.
 */
export function TShape() {
  return (
    <figure className="relative mx-auto h-[272px] w-[300px] flex-shrink-0 sm:mx-0" style={MONO}>
      <figcaption className="sr-only">
        A letter T. The wide bar is labelled applied AI and full stack. The long stem is labelled
        frontend, with React, TypeScript, design systems, performance and accessibility down its
        length.
      </figcaption>

      {/* Bar — breadth */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
        className="absolute left-0 right-0 top-0 flex h-11 origin-center items-center justify-between bg-forest px-3 text-[10px] uppercase tracking-widest text-paper"
        aria-hidden="true"
      >
        <span>Applied AI</span>
        <span>Full stack</span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute left-0 top-[52px] w-[104px] text-[10px] leading-relaxed text-ink/60"
        aria-hidden="true"
      >
        Agents, MCP, evaluation
      </motion.p>

      {/* Stem — depth */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
        className="absolute left-1/2 top-11 h-[228px] w-14 -translate-x-1/2 origin-top overflow-hidden bg-forest"
        aria-hidden="true"
      >
        <span
          className="absolute left-1/2 top-4 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-paper"
          style={{ writingMode: "vertical-rl" }}
        >
          Frontend
        </span>
        <motion.span
          className="absolute left-0 right-0 h-1.5 bg-gold"
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 2.4, delay: 1.4, repeat: Infinity, repeatDelay: 0.8, ease: "easeIn" }}
        />
      </motion.div>

      {/* Depth marks beside the stem */}
      <ul className="absolute left-[186px] top-[60px] space-y-[22px] text-[10px] text-ink/70" aria-hidden="true">
        {DEPTH.map((label, index) => (
          <motion.li
            key={label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 + index * 0.12 }}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <span className="h-px w-3 bg-ink/40" />
            {label}
          </motion.li>
        ))}
      </ul>
    </figure>
  );
}
