/**
 * A2UI (Agent-to-User Interface Protocol)
 *
 * Defines envelope types for generative UI - agents generating rich,
 * interactive components that render natively in the frontend.
 * Based on Google's A2UI specification (v0.8).
 */

// ── Envelope Types ───────────────────────────────────────────────────────────

export interface A2UIMetadataEnvelope {
  type: "metadata";
  componentType: string;
  mimeType: string;
}

export interface A2UIDataEnvelope {
  type: "data";
  componentType: string;
  props: Record<string, unknown>;
}

export interface A2UIEndEnvelope {
  type: "end";
  componentType: string;
}

export type A2UIEnvelope =
  | A2UIMetadataEnvelope
  | A2UIDataEnvelope
  | A2UIEndEnvelope;

// ── Component Types ──────────────────────────────────────────────────────────

export const A2UI_COMPONENTS = {
  PERSONA_CARD: "persona-card",
  RECOMMENDED_PROJECTS: "recommended-projects",
  RELEVANT_EXPERIENCE: "relevant-experience",
  SUGGESTED_READING: "suggested-reading",
} as const;

export type A2UIComponentType =
  (typeof A2UI_COMPONENTS)[keyof typeof A2UI_COMPONENTS];

// ── Component Props Types ────────────────────────────────────────────────────

export interface PersonaCardProps {
  type: string;
  confidence: number;
  traits: string[];
  reasoning: string;
  emoji: string;
}

export interface RecommendedProjectsProps {
  projects: Array<{
    title: string;
    description: string;
    tags: string[];
    url?: string;
    relevance: string;
  }>;
}

export interface RelevantExperienceProps {
  experiences: Array<{
    company: string;
    role: string;
    period: string;
    highlights: string[];
    relevance: string;
  }>;
}

export interface SuggestedReadingProps {
  posts: Array<{
    title: string;
    slug: string;
    excerpt: string;
    relevance: string;
  }>;
}

// ── Marker Parsing ───────────────────────────────────────────────────────────

const MARKER_PREFIX = "{{UI:";
const MARKER_SUFFIX = "}}";

export interface ParsedMarker {
  fullMatch: string;
  componentType: string;
  props: Record<string, unknown>;
}

/**
 * Parse A2UI markers from a text buffer using brace-counting.
 * Handles arbitrary JSON nesting depth (arrays of objects, etc.).
 * Format: {{UI:component-type:{...json props...}}}
 */
export function parseA2UIMarkers(text: string): {
  markers: ParsedMarker[];
  cleanText: string;
} {
  const markers: ParsedMarker[] = [];
  let cleanText = text;
  let searchFrom = 0;

  while (searchFrom < text.length) {
    const prefixIdx = text.indexOf(MARKER_PREFIX, searchFrom);
    if (prefixIdx === -1) break;

    // Extract component type (between prefix and next ":")
    const typeStart = prefixIdx + MARKER_PREFIX.length;
    const typeEnd = text.indexOf(":", typeStart);
    if (typeEnd === -1) { searchFrom = typeStart; continue; }

    const componentType = text.slice(typeStart, typeEnd);
    if (!/^[\w-]+$/.test(componentType)) { searchFrom = typeStart; continue; }

    // Find matching JSON object using brace counting
    const jsonStart = typeEnd + 1;
    if (text[jsonStart] !== "{") { searchFrom = jsonStart; continue; }

    let depth = 0;
    let inString = false;
    let escaped = false;
    let jsonEnd = -1;

    for (let i = jsonStart; i < text.length; i++) {
      const ch = text[i];
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) { jsonEnd = i; break; }
      }
    }

    if (jsonEnd === -1) break; // Incomplete JSON - need more data

    // Check for closing `}}`
    const afterJson = jsonEnd + 1;
    if (text.slice(afterJson, afterJson + MARKER_SUFFIX.length) !== MARKER_SUFFIX) {
      searchFrom = afterJson;
      continue;
    }

    const fullMatch = text.slice(prefixIdx, afterJson + MARKER_SUFFIX.length);
    const jsonStr = text.slice(jsonStart, jsonEnd + 1);

    try {
      const props = JSON.parse(jsonStr) as Record<string, unknown>;
      markers.push({ fullMatch, componentType, props });
      cleanText = cleanText.replace(fullMatch, "");
    } catch {
      // Malformed JSON, skip
    }

    searchFrom = afterJson + MARKER_SUFFIX.length;
  }

  return { markers, cleanText };
}

/**
 * Create the three-envelope sequence for an A2UI component.
 */
export function createA2UIEnvelopes(
  componentType: string,
  props: Record<string, unknown>
): [A2UIMetadataEnvelope, A2UIDataEnvelope, A2UIEndEnvelope] {
  return [
    { type: "metadata", componentType, mimeType: "application/json" },
    { type: "data", componentType, props },
    { type: "end", componentType },
  ];
}
