"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useVisitorSignals } from "./hooks/useVisitorSignals";
import { VisitorSignalsDisplay } from "./VisitorSignals";
import { AgentPipeline } from "./AgentPipeline";
import { ProtocolInspector } from "./ProtocolInspector";
import { PersonaResult } from "./PersonaResult";
import type { AGUIEvent } from "@/lib/protocols/ag-ui";
import { ScrollReveal } from "@/components/blog/ai-hiring/shared/ScrollReveal";

interface A2UIComponent {
  componentType: string;
  props: Record<string, unknown>;
}

export function LiveDemoSection() {
  const signals = useVisitorSignals();
  const [events, setEvents] = useState<AGUIEvent[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [phase, setPhase] = useState<string | null>(null);
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [components, setComponents] = useState<A2UIComponent[]>([]);
  const [textContent, setTextContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!signals || isRunning) return;

    // Reset state
    setEvents([]);
    setActiveAgent(null);
    setPhase(null);
    setCompletedAgents([]);
    setComponents([]);
    setTextContent("");
    setError(null);
    setIsStreaming(true);
    setIsRunning(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/visitor-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signals),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6);
          try {
            const event: AGUIEvent = JSON.parse(json);
            setEvents((prev) => [...prev, event]);
            processEvent(event);
          } catch {
            // Skip malformed events
          }
        }
      }

      // Process any remaining buffer
      if (buffer.startsWith("data: ")) {
        try {
          const event: AGUIEvent = JSON.parse(buffer.slice(6));
          setEvents((prev) => [...prev, event]);
          processEvent(event);
        } catch {
          // Skip
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsStreaming(false);
      setIsRunning(false);
    }
  }, [signals, isRunning]);

  const processEvent = useCallback((event: AGUIEvent) => {
    switch (event.type) {
      case "STATE_DELTA": {
        const delta = event.delta;
        if (delta.activeAgent) setActiveAgent(delta.activeAgent as string);
        if (delta.phase) setPhase(delta.phase as string);
        break;
      }
      case "TEXT_MESSAGE_CONTENT":
        setTextContent((prev) => prev + event.delta);
        break;
      case "CUSTOM": {
        if (event.name === "a2a:task-completed") {
          const from = (event.payload as Record<string, unknown>)?.from as string;
          if (from) setCompletedAgents((prev) => [...new Set([...prev, from])]);
        }
        if (event.name === "a2ui:envelope") {
          const envelope = event.payload as Record<string, unknown>;
          if (envelope.type === "data" && envelope.componentType && envelope.props) {
            setComponents((prev) => [
              ...prev,
              {
                componentType: envelope.componentType as string,
                props: envelope.props as Record<string, unknown>,
              },
            ]);
          }
        }
        break;
      }
    }
  }, []);

  return (
    <section id="live-demo" className="mb-20">
      <ScrollReveal>
        <div className="mb-6">
          <span className="text-xs font-mono text-ink/30 tracking-wider uppercase">
            Live Demo
          </span>
          <h2 className="text-2xl font-bold text-ink mt-1 mb-2">
            Visitor Intelligence Pipeline
          </h2>
          <p className="text-sm text-ink/60 max-w-xl">
            Click "Run Analysis" to watch three agents collaborate in real-time.
            The Tracker collects your signals, the Profiler classifies your persona,
            and the Advisor generates personalized recommendations.
          </p>
        </div>
      </ScrollReveal>

      {/* Signals + Run Button */}
      <div className="mb-6">
        <VisitorSignalsDisplay signals={signals} />
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={runAnalysis}
            disabled={!signals || isRunning}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isRunning
                ? "bg-blue-100 text-blue-400 dark:bg-blue-950/30 dark:text-blue-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm"
            }`}
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⚡
                </motion.span>
                Analyzing...
              </span>
            ) : (
              "Run Analysis"
            )}
          </button>
          {error && (
            <span className="text-sm text-red-500">{error}</span>
          )}
        </div>
      </div>

      {/* Agent Pipeline - full width */}
      <AgentPipeline
        activeAgent={activeAgent}
        phase={phase}
        completedAgents={completedAgents}
      />

      {/* Results + Inspector side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PersonaResult
            components={components}
            textContent={textContent}
            isStreaming={isStreaming}
          />
        </div>
        <div className="lg:col-span-2">
          <ProtocolInspector events={events} />
        </div>
      </div>
    </section>
  );
}
