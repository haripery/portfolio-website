/**
 * Profiler Agent
 *
 * Uses Anthropic to classify visitor signals into a persona.
 */

import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import type { EnrichedSignals } from "./tracker-agent";

// ── Persona Schema ───────────────────────────────────────────────────────────

const personaSchema = z.object({
  type: z
    .enum([
      "recruiter",
      "developer",
      "student",
      "hiring-manager",
      "curious-visitor",
    ])
    .describe("The most likely visitor persona"),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence percentage (0-100)"),
  traits: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("Key behavioral traits observed"),
  reasoning: z
    .string()
    .describe(
      "One-sentence explanation of why this persona was chosen, based on the signals"
    ),
  emoji: z
    .string()
    .describe("A single emoji that represents this persona type"),
});

export type Persona = z.infer<typeof personaSchema>;

// ── Profiler Logic ───────────────────────────────────────────────────────────

export async function classifyVisitor(
  signals: EnrichedSignals
): Promise<Persona> {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: personaSchema,
    messages: [
      {
        role: "user",
        content: `Classify this website visitor into a persona based on their browsing signals.

Visitor Signals:
- Referrer: ${signals.referrerCategory} (${signals.referrerDomain})
- Device: ${signals.deviceType}, ${signals.browser}
- Pages viewed: ${signals.pagesViewed.join(", ") || "just arrived"}
- Page categories: ${signals.pageCategories.join(", ")}
- Time on site: ${signals.timeOnSite}s
- Scroll depth: ${signals.scrollDepth}%
- Engagement: ${signals.engagementLevel}
- UTM source: ${signals.utmSource || "none"}
- UTM medium: ${signals.utmMedium || "none"}
- Current page: ${signals.currentPage}

Persona types:
- recruiter: HR/talent acquisition professional evaluating a candidate
- developer: Fellow engineer exploring technical projects/blog posts
- student: CS student or bootcamp learner seeking guidance
- hiring-manager: Engineering manager assessing technical fit
- curious-visitor: General visitor browsing casually

Consider: LinkedIn referrers are often recruiters/hiring managers. GitHub referrers are often developers. Google/direct can be anyone. High engagement with projects suggests developer interest. Blog-focused browsing suggests learning intent.`,
      },
    ],
  });

  return object;
}
