"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AGUIEvent } from "@/lib/protocols/ag-ui";

interface Props {
  events: AGUIEvent[];
}

type Tab = "ag-ui" | "a2a" | "a2ui";

const EVENT_COLORS: Record<string, string> = {
  RUN_STARTED: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
  RUN_FINISHED: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
  RUN_ERROR: "text-red-500 bg-red-50 dark:bg-red-950/30",
  TEXT_MESSAGE_START: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  TEXT_MESSAGE_CONTENT: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  TEXT_MESSAGE_END: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  TOOL_CALL_START: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
  TOOL_CALL_ARGS: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  TOOL_CALL_END: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
  STATE_DELTA: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
  CUSTOM: "text-pink-500 bg-pink-50 dark:bg-pink-950/30",
};

function formatTimestamp(ts: number, baseTime: number): string {
  const diff = ts - baseTime;
  if (diff < 1000) return `+${diff}ms`;
  return `+${(diff / 1000).toFixed(1)}s`;
}

function getEventSummary(event: AGUIEvent): string {
  switch (event.type) {
    case "RUN_STARTED": return `Run ${event.runId}`;
    case "RUN_FINISHED": return `Run ${event.runId} complete`;
    case "RUN_ERROR": return event.message;
    case "TEXT_MESSAGE_START": return `Message ${event.messageId}`;
    case "TEXT_MESSAGE_CONTENT": return event.delta.slice(0, 50) + (event.delta.length > 50 ? "..." : "");
    case "TEXT_MESSAGE_END": return `End ${event.messageId}`;
    case "TOOL_CALL_START": return event.toolName;
    case "TOOL_CALL_ARGS": {
      try { return JSON.stringify(JSON.parse(event.args)).slice(0, 60); } catch { return event.args.slice(0, 60); }
    }
    case "TOOL_CALL_END": {
      try { return JSON.stringify(JSON.parse(event.result)).slice(0, 60); } catch { return event.result.slice(0, 60); }
    }
    case "STATE_DELTA": return JSON.stringify(event.delta).slice(0, 60);
    case "CUSTOM": return `${event.name}`;
    default: return "";
  }
}

function EventRow({ event, baseTime }: { event: AGUIEvent; baseTime: number }) {
  const [expanded, setExpanded] = useState(false);
  const colors = EVENT_COLORS[event.type] ?? "text-gray-500 bg-gray-50";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="border-b border-[var(--ink)]/5 last:border-0"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-[var(--ink)]/[0.02] transition-colors"
      >
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${colors} shrink-0`}>
          {event.type}
        </span>
        <span className="text-[10px] text-[var(--ink)]/40 font-mono shrink-0">
          {formatTimestamp(event.timestamp, baseTime)}
        </span>
        <span className="text-[10px] text-[var(--ink)]/60 truncate flex-1">
          {getEventSummary(event)}
        </span>
        <span className="text-[var(--ink)]/30 text-xs shrink-0">
          {expanded ? "▾" : "▸"}
        </span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <pre className="text-[10px] font-mono text-[var(--ink)]/50 px-2 pb-2 whitespace-pre-wrap break-all">
              {JSON.stringify(event, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ProtocolInspector({ events }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("ag-ui");
  const scrollRef = useRef<HTMLDivElement>(null);

  const baseTime = events[0]?.timestamp ?? Date.now();

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  // Filter events by tab
  const filteredEvents = events.filter((e) => {
    if (activeTab === "ag-ui") return e.type !== "CUSTOM";
    if (activeTab === "a2a") return e.type === "CUSTOM" && "name" in e && (e.name as string).startsWith("a2a:");
    if (activeTab === "a2ui") return e.type === "CUSTOM" && "name" in e && (e.name as string).startsWith("a2ui:");
    return true;
  });

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "ag-ui", label: "AG-UI", count: events.filter((e) => e.type !== "CUSTOM").length },
    { id: "a2a", label: "A2A", count: events.filter((e) => e.type === "CUSTOM" && "name" in e && (e.name as string).startsWith("a2a:")).length },
    { id: "a2ui", label: "A2UI", count: events.filter((e) => e.type === "CUSTOM" && "name" in e && (e.name as string).startsWith("a2ui:")).length },
  ];

  return (
    <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--ink)]/[0.01] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--ink)]/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-[var(--ink)] border-b-2 border-blue-500 bg-[var(--ink)]/[0.02]"
                : "text-[var(--ink)]/40 hover:text-[var(--ink)]/60"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[var(--ink)]/5 text-[10px] font-mono">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div ref={scrollRef} className="max-h-[400px] overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-4 text-center text-xs text-[var(--ink)]/30 italic">
            {events.length === 0
              ? "Run the analysis to see protocol events..."
              : `No ${activeTab.toUpperCase()} events yet`}
          </div>
        ) : (
          filteredEvents.map((event, i) => (
            <EventRow key={i} event={event} baseTime={baseTime} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--ink)]/5 px-2 py-1 flex justify-between">
        <span className="text-[9px] text-[var(--ink)]/30 font-mono">
          {events.length} total events
        </span>
        <span className="text-[9px] text-[var(--ink)]/30 font-mono">
          {activeTab.toUpperCase()} Protocol
        </span>
      </div>
    </div>
  );
}
