"use client";

import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";

const MONO = { fontFamily: "var(--font-jetbrains-mono), monospace" };
const DISPLAY = { fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" };
const EASE = [0.2, 0.7, 0.2, 1] as const;

function useCountUp(to: number, duration = 1.1) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [to, duration, reduce]);
  return reduce ? to : value;
}

function useTicker(intervalMs: number) {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, reduce]);
  return tick;
}

function Big({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-5xl font-bold leading-none tracking-tight text-forest sm:text-6xl" style={DISPLAY}>
      {children}
    </p>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-sm text-ink/60">{children}</p>;
}

/** drop:850:320:ms:label — a number falling from one value to another */
function Drop({ from, to, unit, label }: { from: number; to: number; unit: string; label: string }) {
  const progress = useCountUp(100);
  const now = Math.round(from - ((from - to) * progress) / 100);
  return (
    <div>
      <Big>
        {now}
        <span className="text-2xl">{unit}</span>
      </Big>
      <div className="mt-5 space-y-2 text-xs text-ink/70" style={MONO}>
        <div className="flex items-center gap-3">
          <div className="h-3 flex-1 bg-ink/20" />
          <span className="w-16">
            {from}
            {unit}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <motion.div
              className="h-3 bg-forest"
              initial={{ width: "100%" }}
              animate={{ width: `${Math.round((to / from) * 100)}%` }}
              transition={{ duration: 1.1, ease: EASE }}
            />
          </div>
          <span className="w-16">
            {to}
            {unit}
          </span>
        </div>
      </div>
      <Caption>{label}</Caption>
    </div>
  );
}

/** percent:60:label — ten blocks, the reduced share fading out */
function Percent({ value, label }: { value: number; label: string }) {
  const now = useCountUp(value);
  const removed = Math.round(value / 10);
  return (
    <div>
      <Big>{now}%</Big>
      <div className="mt-5 grid max-w-md grid-cols-10 gap-1.5">
        {Array.from({ length: 10 }, (_, index) => {
          const fades = index >= 10 - removed;
          return (
            <motion.div
              key={index}
              className="h-8 border border-forest bg-forest"
              initial={{ opacity: 1 }}
              animate={{ opacity: fades ? 0.15 : 1 }}
              transition={{ delay: 0.3 + (index - (10 - removed)) * 0.08, duration: 0.3 }}
            />
          );
        })}
      </div>
      <Caption>{label}</Caption>
    </div>
  );
}

/** stream:10000:label — a count-up over a moving event stream */
function Stream({ value, label }: { value: number; label: string }) {
  const now = useCountUp(value);
  const tick = useTicker(180);
  return (
    <div>
      <Big>
        {now.toLocaleString("en-US")}+<span className="text-2xl">/s</span>
      </Big>
      <div className="mt-5 flex h-10 max-w-md items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: 44 }, (_, index) => {
          const seed = index + tick;
          const height = 15 + ((seed * 37 + ((seed * seed) % 11) * 5) % 85);
          return (
            <div
              key={index}
              className="flex-1 bg-forest transition-[height] duration-150"
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
      <Caption>{label}</Caption>
    </div>
  );
}

/** steps:A|B|C|D — a pipeline with the active step moving along */
function Steps({ steps }: { steps: string[] }) {
  const tick = useTicker(1100);
  const active = tick % steps.length;
  const columns =
    steps.length >= 5 ? "sm:grid-cols-5" : steps.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";
  return (
    <ol className={`grid max-w-2xl gap-2 ${columns}`}>
      {steps.map((step, index) => (
        <li
          key={step}
          className={`border p-3 transition-colors duration-300 ${
            index === active ? "border-gold bg-gold/30" : "border-ink/15 bg-transparent"
          }`}
          style={{ borderRadius: 2 }}
        >
          <span className="block text-[10px] text-coral" style={MONO}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="mt-1 block text-sm font-semibold leading-snug text-forest">{step}</span>
        </li>
      ))}
    </ol>
  );
}

/** crowd:Thousands:label — a headline word over a field of dots filling in */
function Crowd({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <Big>{value}</Big>
      <div className="mt-5 grid max-w-md grid-cols-[repeat(24,minmax(0,1fr))] gap-1.5" aria-hidden="true">
        {Array.from({ length: 72 }, (_, index) => (
          <motion.span
            key={index}
            className="aspect-square rounded-full bg-forest"
            initial={{ opacity: 0.12, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + ((index * 7) % 72) * 0.012, duration: 0.25 }}
          />
        ))}
      </div>
      <Caption>{label}</Caption>
    </div>
  );
}

/** stat:value:label — a single figure */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <Big>{value}</Big>
      <Caption>{label}</Caption>
    </motion.div>
  );
}

/** tags:A|B|C — a set of things, landing one by one with a moving highlight */
function Tags({ items }: { items: string[] }) {
  const tick = useTicker(1300);
  const active = tick % items.length;
  return (
    <ul className="flex max-w-2xl flex-wrap gap-2">
      {items.map((item, index) => (
        <motion.li
          key={item}
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15 + index * 0.1, duration: 0.3 }}
          className={`border px-3 py-2 text-sm font-semibold text-forest transition-colors duration-500 ${
            index === active ? "border-gold bg-gold/30" : "border-ink/15"
          }`}
          style={{ borderRadius: 2 }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

/** devices:Phone|Tablet|Desktop — outlined screens with a tap moving across them */
function Devices({ labels }: { labels: string[] }) {
  const tick = useTicker(1200);
  const active = tick % labels.length;
  const shapes = ["h-16 w-9", "h-16 w-12", "h-14 w-24", "h-14 w-24"];
  return (
    <ul className="flex flex-wrap items-end gap-6">
      {labels.map((label, index) => (
        <motion.li
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + index * 0.12 }}
          className="text-center"
        >
          <div
            className={`relative mx-auto border-2 transition-colors duration-300 ${shapes[index] ?? shapes[2]} ${
              index === active ? "border-gold" : "border-forest"
            }`}
            style={{ borderRadius: 4 }}
          >
            <span
              className={`absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold transition-opacity duration-300 ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
          <span className="mt-2 block text-[10px] uppercase tracking-widest text-ink/60" style={MONO}>
            {label}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

/** anomaly:label — a steady stream with one spike picked out as it passes */
function Anomaly({ label }: { label: string }) {
  const tick = useTicker(200);
  const count = 44;
  const spike = count - 1 - (tick % (count + 8));
  return (
    <div>
      <div className="flex h-16 max-w-md items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => {
          const seed = index + tick;
          const isSpike = index === spike;
          const height = isSpike ? 100 : 18 + ((seed * 29 + ((seed * seed) % 7) * 4) % 32);
          return (
            <div
              key={index}
              className={`flex-1 transition-[height] duration-150 ${isSpike ? "bg-coral" : "bg-forest/70"}`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
      <Caption>{label}</Caption>
    </div>
  );
}

/** flow:Title^detail|Title^detail|… — an architecture flow, read left to right, the active node moving along it */
function Flow({ nodes }: { nodes: { title: string; sub: string }[] }) {
  const tick = useTicker(1400);
  const active = tick % nodes.length;
  return (
    <ol className="flex flex-col gap-1 lg:flex-row lg:items-stretch lg:gap-0">
      {nodes.map((node, index) => (
        <motion.li
          key={node.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.12, duration: 0.3 }}
          className="flex flex-col lg:flex-1 lg:flex-row lg:items-stretch"
        >
          <div
            className={`flex-1 border p-3 transition-colors duration-300 ${
              index === active ? "border-gold bg-gold/30" : "border-ink/15"
            }`}
            style={{ borderRadius: 2 }}
          >
            <span className="block text-[10px] text-coral" style={MONO}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-sm font-semibold leading-snug text-forest">{node.title}</span>
            {node.sub && <span className="mt-1 block text-xs leading-snug text-ink/60">{node.sub}</span>}
          </div>
          {index < nodes.length - 1 && (
            <span className="flex items-center justify-center py-1 text-ink/40 lg:px-1 lg:py-0" aria-hidden="true">
              <ArrowDown className="h-4 w-4 lg:hidden" />
              <ArrowRight className="hidden h-4 w-4 lg:block" />
            </span>
          )}
        </motion.li>
      ))}
    </ol>
  );
}

export function HighlightViz({ spec }: { spec: string }) {
  const [kind, ...args] = spec.split(":");
  switch (kind) {
    case "drop":
      return <Drop from={Number(args[0])} to={Number(args[1])} unit={args[2] ?? ""} label={args[3] ?? ""} />;
    case "percent":
      return <Percent value={Number(args[0])} label={args[1] ?? ""} />;
    case "stream":
      return <Stream value={Number(args[0])} label={args[1] ?? ""} />;
    case "flow":
      return (
        <Flow
          nodes={args
            .join(":")
            .split("|")
            .map((part) => {
              const [title, sub = ""] = part.split("^");
              return { title, sub };
            })}
        />
      );
    case "steps":
      return <Steps steps={args.join(":").split("|")} />;
    case "crowd":
      return <Crowd value={args[0] ?? ""} label={args[1] ?? ""} />;
    case "tags":
      return <Tags items={args.join(":").split("|")} />;
    case "devices":
      return <Devices labels={args.join(":").split("|")} />;
    case "anomaly":
      return <Anomaly label={args.join(":")} />;
    case "stat":
      return <Stat value={args[0] ?? ""} label={args[1] ?? ""} />;
    default:
      return null;
  }
}
