export const PROTOCOL_DESCRIPTIONS = {
  "AG-UI": {
    name: "Agent-User Interaction Protocol",
    creator: "CopilotKit",
    description:
      "Standardized event types for agent-to-frontend communication over SSE/WebSockets. Defines how agents stream text, call tools, and update state.",
    events: [
      "RUN_STARTED", "RUN_FINISHED", "TEXT_MESSAGE_START",
      "TEXT_MESSAGE_CONTENT", "TEXT_MESSAGE_END", "TOOL_CALL_START",
      "TOOL_CALL_ARGS", "TOOL_CALL_END", "STATE_DELTA", "CUSTOM",
    ],
    specUrl: "https://docs.ag-ui.com",
  },
  "A2A": {
    name: "Agent-to-Agent Protocol",
    creator: "Google",
    description:
      "Enables multi-agent communication through Agent Cards (discovery), Tasks (work units), and Messages (data exchange).",
    primitives: ["Agent Card", "Task", "Message", "Part"],
    specUrl: "https://google.github.io/A2A",
  },
  "A2UI": {
    name: "Agent-to-User Interface Protocol",
    creator: "Google",
    description:
      "Generative UI specification - agents generate rich, interactive components via JSONL streaming with metadata/data/end envelopes.",
    envelopes: ["metadata", "data", "end"],
    specUrl: "https://google.github.io/A2UI",
  },
};
