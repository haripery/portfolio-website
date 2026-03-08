/**
 * AG-UI (Agent-User Interaction Protocol)
 *
 * Defines the event types for agent-to-frontend communication via SSE.
 * Based on the AG-UI specification by CopilotKit.
 * ~16 standardized event types over HTTP/SSE.
 */

// ── Event Types ──────────────────────────────────────────────────────────────

export type AGUIEventType =
  | "RUN_STARTED"
  | "RUN_FINISHED"
  | "RUN_ERROR"
  | "TEXT_MESSAGE_START"
  | "TEXT_MESSAGE_CONTENT"
  | "TEXT_MESSAGE_END"
  | "TOOL_CALL_START"
  | "TOOL_CALL_ARGS"
  | "TOOL_CALL_END"
  | "STATE_SNAPSHOT"
  | "STATE_DELTA"
  | "CUSTOM";

export interface AGUIBaseEvent {
  type: AGUIEventType;
  timestamp: number;
}

export interface RunStartedEvent extends AGUIBaseEvent {
  type: "RUN_STARTED";
  runId: string;
}

export interface RunFinishedEvent extends AGUIBaseEvent {
  type: "RUN_FINISHED";
  runId: string;
}

export interface RunErrorEvent extends AGUIBaseEvent {
  type: "RUN_ERROR";
  runId: string;
  message: string;
}

export interface TextMessageStartEvent extends AGUIBaseEvent {
  type: "TEXT_MESSAGE_START";
  messageId: string;
  role: "agent";
}

export interface TextMessageContentEvent extends AGUIBaseEvent {
  type: "TEXT_MESSAGE_CONTENT";
  messageId: string;
  delta: string;
}

export interface TextMessageEndEvent extends AGUIBaseEvent {
  type: "TEXT_MESSAGE_END";
  messageId: string;
}

export interface ToolCallStartEvent extends AGUIBaseEvent {
  type: "TOOL_CALL_START";
  toolCallId: string;
  toolName: string;
}

export interface ToolCallArgsEvent extends AGUIBaseEvent {
  type: "TOOL_CALL_ARGS";
  toolCallId: string;
  args: string; // JSON string of the arguments
}

export interface ToolCallEndEvent extends AGUIBaseEvent {
  type: "TOOL_CALL_END";
  toolCallId: string;
  result: string; // JSON string of the result
}

export interface StateSnapshotEvent extends AGUIBaseEvent {
  type: "STATE_SNAPSHOT";
  state: Record<string, unknown>;
}

export interface StateDeltaEvent extends AGUIBaseEvent {
  type: "STATE_DELTA";
  delta: Record<string, unknown>;
}

export interface CustomEvent extends AGUIBaseEvent {
  type: "CUSTOM";
  name: string;
  payload: unknown;
}

export type AGUIEvent =
  | RunStartedEvent
  | RunFinishedEvent
  | RunErrorEvent
  | TextMessageStartEvent
  | TextMessageContentEvent
  | TextMessageEndEvent
  | ToolCallStartEvent
  | ToolCallArgsEvent
  | ToolCallEndEvent
  | StateSnapshotEvent
  | StateDeltaEvent
  | CustomEvent;

// ── SSE Emitter ──────────────────────────────────────────────────────────────

/**
 * Wraps a ReadableStream controller to emit AG-UI events as SSE.
 */
export class AGUIEmitter {
  private controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  private encoder = new TextEncoder();
  private events: AGUIEvent[] = [];
  readonly stream: ReadableStream<Uint8Array>;

  constructor() {
    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller;
      },
      cancel: () => {
        this.controller = null;
      },
    });
  }

  emit(event: AGUIEvent): void {
    this.events.push(event);
    if (!this.controller) return;
    const line = `data: ${JSON.stringify(event)}\n\n`;
    this.controller.enqueue(this.encoder.encode(line));
  }

  close(): void {
    this.controller?.close();
    this.controller = null;
  }

  /** Get all emitted events (useful for debugging / inspector) */
  getEvents(): AGUIEvent[] {
    return [...this.events];
  }

  // ── Convenience helpers ──

  runStarted(runId: string): void {
    this.emit({ type: "RUN_STARTED", runId, timestamp: Date.now() });
  }

  runFinished(runId: string): void {
    this.emit({ type: "RUN_FINISHED", runId, timestamp: Date.now() });
  }

  runError(runId: string, message: string): void {
    this.emit({ type: "RUN_ERROR", runId, message, timestamp: Date.now() });
  }

  textStart(messageId: string): void {
    this.emit({
      type: "TEXT_MESSAGE_START",
      messageId,
      role: "agent",
      timestamp: Date.now(),
    });
  }

  textContent(messageId: string, delta: string): void {
    this.emit({
      type: "TEXT_MESSAGE_CONTENT",
      messageId,
      delta,
      timestamp: Date.now(),
    });
  }

  textEnd(messageId: string): void {
    this.emit({ type: "TEXT_MESSAGE_END", messageId, timestamp: Date.now() });
  }

  toolCallStart(toolCallId: string, toolName: string): void {
    this.emit({
      type: "TOOL_CALL_START",
      toolCallId,
      toolName,
      timestamp: Date.now(),
    });
  }

  toolCallArgs(toolCallId: string, args: unknown): void {
    this.emit({
      type: "TOOL_CALL_ARGS",
      toolCallId,
      args: JSON.stringify(args),
      timestamp: Date.now(),
    });
  }

  toolCallEnd(toolCallId: string, result: unknown): void {
    this.emit({
      type: "TOOL_CALL_END",
      toolCallId,
      result: JSON.stringify(result),
      timestamp: Date.now(),
    });
  }

  stateDelta(delta: Record<string, unknown>): void {
    this.emit({ type: "STATE_DELTA", delta, timestamp: Date.now() });
  }

  custom(name: string, payload: unknown): void {
    this.emit({ type: "CUSTOM", name, payload, timestamp: Date.now() });
  }
}
