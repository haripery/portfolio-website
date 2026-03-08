"use client";

import { PersonaCard } from "./ui/PersonaCard";
import { RecommendedProjects } from "./ui/RecommendedProjects";
import { RelevantExperience } from "./ui/RelevantExperience";
import { SuggestedReading } from "./ui/SuggestedReading";
import { A2UI_COMPONENTS } from "@/lib/protocols/a2ui";
import type {
  PersonaCardProps,
  RecommendedProjectsProps,
  RelevantExperienceProps,
  SuggestedReadingProps,
} from "@/lib/protocols/a2ui";

interface GeneratedUIProps {
  componentType: string;
  props: Record<string, unknown>;
}

/**
 * Registry that maps A2UI component type strings to React components.
 * When the Advisor Agent emits A2UI envelopes, this renders the right component.
 */
export function GeneratedUI({ componentType, props }: GeneratedUIProps) {
  switch (componentType) {
    case A2UI_COMPONENTS.PERSONA_CARD:
      return <PersonaCard {...(props as unknown as PersonaCardProps)} />;

    case A2UI_COMPONENTS.RECOMMENDED_PROJECTS:
      return <RecommendedProjects {...(props as unknown as RecommendedProjectsProps)} />;

    case A2UI_COMPONENTS.RELEVANT_EXPERIENCE:
      return <RelevantExperience {...(props as unknown as RelevantExperienceProps)} />;

    case A2UI_COMPONENTS.SUGGESTED_READING:
      return <SuggestedReading {...(props as unknown as SuggestedReadingProps)} />;

    default:
      return (
        <div className="rounded border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-300 mb-4">
          Unknown component: <code>{componentType}</code>
        </div>
      );
  }
}
