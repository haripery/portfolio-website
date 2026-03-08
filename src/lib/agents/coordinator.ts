/**
 * Coordinator Agent
 *
 * Orchestrates the visitor intelligence pipeline:
 * Tracker → Profiler → (fetch portfolio data) → Advisor
 *
 * Emits AG-UI events at each transition and manages A2A task lifecycle.
 */

import { AGUIEmitter } from "@/lib/protocols/ag-ui";
import {
  AgentRegistry,
  TRACKER_AGENT_CARD,
  PROFILER_AGENT_CARD,
  ADVISOR_AGENT_CARD,
  COORDINATOR_AGENT_CARD,
} from "@/lib/protocols/a2a";
import { parseA2UIMarkers, createA2UIEnvelopes } from "@/lib/protocols/a2ui";
import { processSignals, type VisitorSignals } from "./tracker-agent";
import { classifyVisitor } from "./profiler-agent";
import { generateRecommendations, type PortfolioData } from "./advisor-agent";
import { getProfile } from "@/actions/profile";
import { getExperiences } from "@/actions/experience";
import { getProjects } from "@/actions/projects";
import { getBlogPosts } from "@/actions/blog";

// ── Portfolio Data Fetcher ───────────────────────────────────────────────────

async function fetchPortfolioData(): Promise<PortfolioData> {
  const [profile, experiences, projects, blogPosts] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects({ featured: true }),
    getBlogPosts({ published: true }),
  ]);

  return {
    profile: profile
      ? {
          name: profile.name ?? "",
          role: profile.role ?? "",
          tagline: profile.tagline ?? "",
          bio: profile.bio ?? "",
        }
      : null,
    experiences: experiences.map((e) => ({
      company: e.company,
      role: e.title,
      period: e.period,
      description: e.description,
      tags: e.tags.map((t) => t.label),
    })),
    projects: projects.map((p) => ({
      title: p.title,
      description: p.description,
      tags: p.tags.map((t) => t.label),
      githubUrl: p.githubUrl,
      liveUrl: p.url,
    })),
    blogPosts: blogPosts.map((b) => ({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      category: b.category,
    })),
  };
}

// ── Coordinator Pipeline ─────────────────────────────────────────────────────

export async function runVisitorIntelPipeline(
  signals: VisitorSignals
): Promise<ReadableStream<Uint8Array>> {
  const emitter = new AGUIEmitter();
  const registry = new AgentRegistry();

  // Register all agents
  registry.register(COORDINATOR_AGENT_CARD);
  registry.register(TRACKER_AGENT_CARD);
  registry.register(PROFILER_AGENT_CARD);
  registry.register(ADVISOR_AGENT_CARD);

  const runId = `run-${Date.now()}`;

  // Run the pipeline asynchronously
  (async () => {
    try {
      emitter.runStarted(runId);
      emitter.stateDelta({ activeAgent: "Coordinator", phase: "starting" });

      // ── Phase 1: Tracker Agent ───────────────────────────────────────

      const trackerTask = registry.createTask("Coordinator", "Tracker Agent");
      registry.updateTaskStatus(trackerTask.id, "working");

      emitter.stateDelta({ activeAgent: "Tracker Agent", phase: "collecting" });
      emitter.toolCallStart("tracker-1", "Tracker Agent");
      emitter.toolCallArgs("tracker-1", { signals });

      // Emit A2A task creation
      emitter.custom("a2a:task-created", {
        taskId: trackerTask.id,
        from: "Coordinator",
        to: "Tracker Agent",
        status: "working",
      });

      const enriched = processSignals(signals);

      registry.addMessage(trackerTask.id, {
        role: "agent",
        agentName: "Tracker Agent",
        parts: [{ type: "data", mimeType: "application/json", data: enriched as unknown as Record<string, unknown> }],
        timestamp: Date.now(),
      });
      registry.updateTaskStatus(trackerTask.id, "completed");

      emitter.toolCallEnd("tracker-1", {
        referrerCategory: enriched.referrerCategory,
        deviceType: enriched.deviceType,
        engagementLevel: enriched.engagementLevel,
        pageCategories: enriched.pageCategories,
      });

      emitter.custom("a2a:task-completed", {
        taskId: trackerTask.id,
        from: "Tracker Agent",
        to: "Coordinator",
      });

      // ── Phase 2: Profiler Agent ──────────────────────────────────────

      const profilerTask = registry.createTask("Coordinator", "Profiler Agent");
      registry.updateTaskStatus(profilerTask.id, "working");

      emitter.stateDelta({ activeAgent: "Profiler Agent", phase: "classifying" });
      emitter.toolCallStart("profiler-1", "Profiler Agent");
      emitter.toolCallArgs("profiler-1", { enrichedSignals: enriched });

      emitter.custom("a2a:task-created", {
        taskId: profilerTask.id,
        from: "Coordinator",
        to: "Profiler Agent",
        status: "working",
      });

      const persona = await classifyVisitor(enriched);

      registry.addMessage(profilerTask.id, {
        role: "agent",
        agentName: "Profiler Agent",
        parts: [{ type: "data", mimeType: "application/json", data: persona as unknown as Record<string, unknown> }],
        timestamp: Date.now(),
      });
      registry.updateTaskStatus(profilerTask.id, "completed");

      emitter.toolCallEnd("profiler-1", persona);

      emitter.custom("a2a:task-completed", {
        taskId: profilerTask.id,
        from: "Profiler Agent",
        to: "Coordinator",
      });

      // ── Phase 2.5: Fetch Portfolio Data ──────────────────────────────

      emitter.stateDelta({ activeAgent: "Coordinator", phase: "fetching-data" });
      emitter.toolCallStart("data-fetch-1", "Portfolio Data Fetch");

      const portfolio = await fetchPortfolioData();

      emitter.toolCallEnd("data-fetch-1", {
        projectCount: portfolio.projects.length,
        experienceCount: portfolio.experiences.length,
        blogPostCount: portfolio.blogPosts.length,
      });

      // ── Phase 3: Advisor Agent ───────────────────────────────────────

      const advisorTask = registry.createTask("Coordinator", "Advisor Agent");
      registry.updateTaskStatus(advisorTask.id, "working");

      emitter.stateDelta({ activeAgent: "Advisor Agent", phase: "generating" });
      emitter.toolCallStart("advisor-1", "Advisor Agent");
      emitter.toolCallArgs("advisor-1", {
        persona: persona.type,
        confidence: persona.confidence,
      });

      emitter.custom("a2a:task-created", {
        taskId: advisorTask.id,
        from: "Coordinator",
        to: "Advisor Agent",
        status: "working",
      });

      const result = await generateRecommendations(persona, portfolio);

      // Stream advisor output with A2UI marker detection
      const messageId = `msg-${Date.now()}`;
      emitter.textStart(messageId);

      let buffer = "";

      for await (const chunk of result.textStream) {
        buffer += chunk;

        // Check for complete markers in buffer
        const { markers, cleanText } = parseA2UIMarkers(buffer);

        if (markers.length > 0) {
          // Emit any clean text before the marker
          if (cleanText.trim()) {
            emitter.textContent(messageId, cleanText);
          }

          // Emit A2UI envelopes for each marker
          for (const marker of markers) {
            const envelopes = createA2UIEnvelopes(
              marker.componentType,
              marker.props
            );
            for (const envelope of envelopes) {
              emitter.custom("a2ui:envelope", envelope);
            }
          }

          buffer = "";
        } else if (!buffer.includes("{{")) {
          // No partial marker in buffer - safe to emit text
          emitter.textContent(messageId, buffer);
          buffer = "";
        } else if (buffer.length > 10000) {
          // Safety: flush oversized buffer as text (malformed marker)
          emitter.textContent(messageId, buffer);
          buffer = "";
        }
        // If buffer contains "{{" but no complete marker, keep buffering
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        const { markers, cleanText } = parseA2UIMarkers(buffer);
        if (cleanText.trim()) {
          emitter.textContent(messageId, cleanText);
        }
        for (const marker of markers) {
          const envelopes = createA2UIEnvelopes(
            marker.componentType,
            marker.props
          );
          for (const envelope of envelopes) {
            emitter.custom("a2ui:envelope", envelope);
          }
        }
      }

      emitter.textEnd(messageId);

      registry.addMessage(advisorTask.id, {
        role: "agent",
        agentName: "Advisor Agent",
        parts: [{ type: "text", text: "Recommendations generated" }],
        timestamp: Date.now(),
      });
      registry.updateTaskStatus(advisorTask.id, "completed");

      emitter.toolCallEnd("advisor-1", { status: "complete" });

      emitter.custom("a2a:task-completed", {
        taskId: advisorTask.id,
        from: "Advisor Agent",
        to: "Coordinator",
      });

      // ── Done ─────────────────────────────────────────────────────────

      emitter.stateDelta({ activeAgent: "Coordinator", phase: "complete" });
      emitter.runFinished(runId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[coordinator] Pipeline error:", message);
      emitter.runError(runId, message);
    } finally {
      emitter.close();
    }
  })();

  return emitter.stream;
}
