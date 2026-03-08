"use client";

import dynamic from "next/dynamic";
import { ReadingProgress } from "@/components/blog/ai-hiring/shared/ReadingProgress";
import { HeroSection } from "./HeroSection";

const InterviewLoopDiagram = dynamic(
  () =>
    import("./InterviewLoopDiagram").then((m) => ({
      default: m.InterviewLoopDiagram,
    })),
  { ssr: false }
);
const ResourceStackSection = dynamic(
  () =>
    import("./ResourceStackSection").then((m) => ({
      default: m.ResourceStackSection,
    })),
  { ssr: false }
);
const FinalThoughtsSection = dynamic(
  () =>
    import("./FinalThoughtsSection").then((m) => ({
      default: m.FinalThoughtsSection,
    })),
  { ssr: false }
);

export function InterviewLoopPost() {
  return (
    <>
      <ReadingProgress />
      <div className="max-w-none">
        <HeroSection />
        <InterviewLoopDiagram />
        <ResourceStackSection />
        <FinalThoughtsSection />
      </div>
    </>
  );
}
