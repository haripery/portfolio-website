/**
 * A2A (Agent-to-Agent Protocol)
 *
 * Defines Agent Cards, Tasks, and Messages for multi-agent communication.
 * Based on Google's A2A specification.
 */

// ── Agent Card ───────────────────────────────────────────────────────────────

export interface AgentCard {
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  endpoint?: string;
}

// ── Message Parts ────────────────────────────────────────────────────────────

export interface TextPart {
  type: "text";
  text: string;
}

export interface DataPart {
  type: "data";
  mimeType: string;
  data: Record<string, unknown>;
}

export interface UIComponentPart {
  type: "ui-component";
  componentType: string;
  props: Record<string, unknown>;
}

export type MessagePart = TextPart | DataPart | UIComponentPart;

// ── Message ──────────────────────────────────────────────────────────────────

export interface A2AMessage {
  role: "user" | "agent";
  agentName: string;
  parts: MessagePart[];
  timestamp: number;
}

// ── Task ─────────────────────────────────────────────────────────────────────

export type TaskStatus = "submitted" | "working" | "completed" | "failed";

export interface A2ATask {
  id: string;
  fromAgent: string;
  toAgent: string;
  status: TaskStatus;
  messages: A2AMessage[];
  createdAt: number;
  updatedAt: number;
}

// ── Agent Registry ───────────────────────────────────────────────────────────

export class AgentRegistry {
  private agents = new Map<string, AgentCard>();
  private tasks: A2ATask[] = [];

  register(card: AgentCard): void {
    this.agents.set(card.name, card);
  }

  getCard(name: string): AgentCard | undefined {
    return this.agents.get(name);
  }

  getAllCards(): AgentCard[] {
    return Array.from(this.agents.values());
  }

  findByCapability(capability: string): AgentCard[] {
    return this.getAllCards().filter((c) =>
      c.capabilities.includes(capability)
    );
  }

  createTask(fromAgent: string, toAgent: string): A2ATask {
    const now = Date.now();
    const task: A2ATask = {
      id: `task-${now}-${Math.random().toString(36).slice(2, 8)}`,
      fromAgent,
      toAgent,
      status: "submitted",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return task;
  }

  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      task.updatedAt = Date.now();
    }
  }

  addMessage(taskId: string, message: A2AMessage): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.messages.push(message);
      task.updatedAt = Date.now();
    }
  }

  getTask(taskId: string): A2ATask | undefined {
    return this.tasks.find((t) => t.id === taskId);
  }

  getAllTasks(): A2ATask[] {
    return [...this.tasks];
  }
}

// ── Pre-configured Agent Cards ───────────────────────────────────────────────

export const TRACKER_AGENT_CARD: AgentCard = {
  name: "Tracker Agent",
  description:
    "Collects and normalizes visitor signals — referrer, device, browsing patterns — into structured context.",
  version: "1.0.0",
  capabilities: ["signal-collection", "context-enrichment"],
};

export const PROFILER_AGENT_CARD: AgentCard = {
  name: "Profiler Agent",
  description:
    "Classifies visitors into personas (recruiter, developer, student, etc.) using AI analysis of behavioral signals.",
  version: "1.0.0",
  capabilities: ["persona-classification", "ai-analysis"],
};

export const ADVISOR_AGENT_CARD: AgentCard = {
  name: "Advisor Agent",
  description:
    "Generates personalized content recommendations with rich UI components based on the visitor persona.",
  version: "1.0.0",
  capabilities: ["content-recommendation", "ui-generation"],
};

export const COORDINATOR_AGENT_CARD: AgentCard = {
  name: "Coordinator",
  description:
    "Orchestrates the visitor intelligence pipeline — routing tasks between Tracker, Profiler, and Advisor agents.",
  version: "1.0.0",
  capabilities: ["orchestration", "task-routing"],
};
