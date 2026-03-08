/**
 * A2UI (Agent-to-User Interface Protocol)
 *
 * Defines envelope types for generative UI — agents generating rich,
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

/**
 * Regex to detect A2UI markers in streamed text.
 * Format: {{UI:component-type:{...json props...}}}
 */
const A2UI_MARKER_REGEX = /\{\{UI:([\w-]+):(\{[^}]*(?:\{[^}]*\}[^}]*)*\})\}\}/g;

export interface ParsedMarker {
  fullMatch: string;
  componentType: string;
  props: Record<string, unknown>;
}

/**
 * Parse A2UI markers from a text buffer.
 * Returns parsed markers and the cleaned text (markers removed).
 */
export function parseA2UIMarkers(text: string): {
  markers: ParsedMarker[];
  cleanText: string;
} {
  const markers: ParsedMarker[] = [];
  let cleanText = text;

  let match: RegExpExecArray | null;
  // Reset regex state
  A2UI_MARKER_REGEX.lastIndex = 0;

  while ((match = A2UI_MARKER_REGEX.exec(text)) !== null) {
    try {
      const props = JSON.parse(match[2]) as Record<string, unknown>;
      markers.push({
        fullMatch: match[0],
        componentType: match[1],
        props,
      });
      cleanText = cleanText.replace(match[0], "");
    } catch {
      // Invalid JSON in marker, skip it
    }
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
