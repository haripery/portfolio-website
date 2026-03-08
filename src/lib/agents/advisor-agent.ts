/**
 * Advisor Agent
 *
 * Generates personalized content recommendations with A2UI component markers.
 * Streams text via Vercel AI SDK with embedded {{UI:component-type:{props}}} markers.
 */

import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import type { Persona } from "./profiler-agent";

// ── Portfolio Data Types ─────────────────────────────────────────────────────

export interface PortfolioData {
  profile: {
    name: string;
    role: string;
    tagline: string;
    bio: string;
  } | null;
  experiences: Array<{
    company: string;
    role: string;
    period: string;
    description: string;
    tags: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    tags: string[];
    githubUrl: string | null;
    liveUrl: string | null;
  }>;
  blogPosts: Array<{
    title: string;
    slug: string;
    excerpt: string | null;
    category: string;
  }>;
}

// ── Advisor Logic ────────────────────────────────────────────────────────────

export async function generateRecommendations(
  persona: Persona,
  portfolio: PortfolioData
) {
  const profileName = portfolio.profile?.name ?? "the portfolio owner";

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    maxOutputTokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a portfolio advisor. Based on the visitor's persona, generate personalized content recommendations for ${profileName}'s portfolio.

VISITOR PERSONA:
- Type: ${persona.type}
- Traits: ${persona.traits.join(", ")}
- Reasoning: ${persona.reasoning}

PORTFOLIO DATA:
${portfolio.profile ? `Name: ${portfolio.profile.name}\nRole: ${portfolio.profile.role}\nTagline: ${portfolio.profile.tagline}` : ""}

Experience:
${portfolio.experiences.map((e) => `- ${e.role} at ${e.company} (${e.period}) [${e.tags.join(", ")}]`).join("\n")}

Projects:
${portfolio.projects.map((p) => `- ${p.title}: ${p.description} [${p.tags.join(", ")}]`).join("\n")}

Blog Posts:
${portfolio.blogPosts.map((b) => `- "${b.title}" (${b.category}) - ${b.excerpt || "No excerpt"}`).join("\n")}

INSTRUCTIONS:
Write a short, personalized message (2-3 sentences) addressing what this visitor type would find most interesting. Then emit EXACTLY these UI components using the marker syntax:

1. A persona card summarizing who they are:
{{UI:persona-card:{"type":"${persona.type}","confidence":${persona.confidence},"traits":${JSON.stringify(persona.traits)},"reasoning":"${persona.reasoning}","emoji":"${persona.emoji}"}}}

2. Top 2-3 most relevant projects for this persona:
{{UI:recommended-projects:{"projects":[{"title":"...","description":"...","tags":[...],"url":"...","relevance":"why this project matters to them"}]}}}

3. Most relevant experience entries (2-3):
{{UI:relevant-experience:{"experiences":[{"company":"...","role":"...","period":"...","highlights":["..."],"relevance":"why this matters to them"}]}}}

4. Recommended blog posts (1-2):
{{UI:suggested-reading:{"posts":[{"title":"...","slug":"...","excerpt":"...","relevance":"why they should read this"}]}}}

IMPORTANT: Use REAL data from the portfolio above. Do not invent projects, companies, or blog posts that don't exist in the data. Each UI marker must be on its own line with no extra whitespace inside the JSON.`,
      },
    ],
  });

  return result;
}
