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
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-ink/15 bg-card text-sm"
    >
      <span className="text-ink/40 text-xs">{label}</span>
      <span className="font-mono text-ink/80 text-xs">{value}</span>
    </motion.div>
  );
}

export function VisitorSignalsDisplay({ signals }: Props) {
  if (!signals) {
    return (
      <div className="text-sm text-ink/40 italic">Collecting signals...</div>
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
      <h4 className="text-xs font-semibold text-ink/40 uppercase tracking-wider mb-2">
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
      <p className="mt-3 max-w-xl text-xs leading-relaxed text-ink/60">
        This demo collects: the page that referred you, the pages you open while this post is in
        the tab, time since you opened it, device, browser, scroll depth, viewport width and any
        utm_source, utm_medium or utm_campaign tags. The pills show the main ones. When you click
        Run they go to this site&apos;s server, which asks a model (Claude) to guess a persona and
        then to pick recommendations. The server keeps nothing but a 15-minute rate-limit count
        against a hash of your IP; the signals pass through Anthropic&apos;s API; your browser keeps
        the page list and a start time for this tab only. The persona is a guess from thin signals,
        so the card shows the model&apos;s own confidence and its one-line reason.
      </p>
    </div>
  );
}
