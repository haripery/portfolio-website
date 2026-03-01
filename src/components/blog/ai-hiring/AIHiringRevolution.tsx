"use client";

import dynamic from "next/dynamic";
import { ReadingProgress } from "./shared/ReadingProgress";
import { TableOfContents } from "./shared/TableOfContents";
import { HeroSection } from "./HeroSection";

// Dynamic imports for heavy sections to improve initial load
const AIPipelineSection = dynamic(
  () => import("./AIPipelineSection").then((m) => ({ default: m.AIPipelineSection })),
  { ssr: false }
);
const DoomLoopSection = dynamic(
  () => import("./DoomLoopSection").then((m) => ({ default: m.DoomLoopSection })),
  { ssr: false }
);
const TrustCrisisSection = dynamic(
  () => import("./TrustCrisisSection").then((m) => ({ default: m.TrustCrisisSection })),
  { ssr: false }
);
const PlatformsSection = dynamic(
  () => import("./PlatformsSection").then((m) => ({ default: m.PlatformsSection })),
  { ssr: false }
);
const EmergingRolesSection = dynamic(
  () => import("./EmergingRolesSection").then((m) => ({ default: m.EmergingRolesSection })),
  { ssr: false }
);
const SkillsSection = dynamic(
  () => import("./SkillsSection").then((m) => ({ default: m.SkillsSection })),
  { ssr: false }
);
const PlaybookSection = dynamic(
  () => import("./PlaybookSection").then((m) => ({ default: m.PlaybookSection })),
  { ssr: false }
);
const ConclusionSection = dynamic(
  () => import("./ConclusionSection").then((m) => ({ default: m.ConclusionSection })),
  { ssr: false }
);

export function AIHiringRevolution() {
  return (
    <>
      <ReadingProgress />
      <TableOfContents />
      <div className="max-w-none">
        <HeroSection />
        <AIPipelineSection />
        <DoomLoopSection />
        <TrustCrisisSection />
        <PlatformsSection />
        <EmergingRolesSection />
        <SkillsSection />
        <PlaybookSection />
        <ConclusionSection />
      </div>
    </>
  );
}
