"use client";

import { motion } from "framer-motion";
import type { VisitorSignals as VisitorSignalsType } from "@/lib/agents/tracker-agent";

interface Props {
  signals: VisitorSignalsType | null;
}

function SignalPill({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--ink)]/10 bg-[var(--ink)]/[0.02] text-sm"
    >
      <span className="text-[var(--ink)]/40 text-xs">{label}</span>
      <span className="font-mono text-[var(--ink)]/80 text-xs">{value}</span>
    </motion.div>
  );
}

export function VisitorSignalsDisplay({ signals }: Props) {
  if (!signals) {
    return (
      <div className="text-sm text-[var(--ink)]/40 italic">Collecting signals...</div>
    );
  }

  const items = [
    { label: "Referrer", value: signals.referrer ? (() => { try { return new URL(signals.referrer).hostname; } catch { return signals.referrer; } })() : "direct" },
    { label: "Device", value: signals.device },
    { label: "Browser", value: signals.browser },
    { label: "Pages", value: String(signals.pagesViewed.length) },
    { label: "Time", value: `${signals.timeOnSite}s` },
    { label: "Scroll", value: `${signals.scrollDepth}%` },
    ...(signals.utmSource ? [{ label: "UTM", value: signals.utmSource }] : []),
  ];

  return (
    <div>
      <h4 className="text-xs font-semibold text-[var(--ink)]/40 uppercase tracking-wider mb-2">
        What agents can see about you
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <SignalPill
            key={item.label}
            label={item.label}
            value={item.value}
            delay={i * 0.05}
          />
        ))}
      </div>
      <p className="text-[10px] text-[var(--ink)]/30 mt-2 italic">
        No personal data stored. Browsing context only.
      </p>
    </div>
  );
}
