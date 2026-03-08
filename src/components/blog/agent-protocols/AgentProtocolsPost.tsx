"use client";

import dynamic from "next/dynamic";
import { ReadingProgress } from "@/components/blog/ai-hiring/shared/ReadingProgress";
import { TableOfContents } from "./TableOfContents";
import { HeroSection } from "./HeroSection";

const ProtocolExplainerSection = dynamic(
  () =>
    import("./ProtocolExplainerSection").then((m) => ({
      default: m.ProtocolExplainerSection,
    })),
  { ssr: false }
);

const LiveDemoSection = dynamic(
  () =>
    import("./LiveDemoSection").then((m) => ({
      default: m.LiveDemoSection,
    })),
  { ssr: false }
);

const ArchitectureSection = dynamic(
  () =>
    import("./ArchitectureSection").then((m) => ({
      default: m.ArchitectureSection,
    })),
  { ssr: false }
);

const WhyThisMattersSection = dynamic(
  () =>
    import("./WhyThisMattersSection").then((m) => ({
      default: m.WhyThisMattersSection,
    })),
  { ssr: false }
);

const CareerImpactSection = dynamic(
  () =>
    import("./CareerImpactSection").then((m) => ({
      default: m.CareerImpactSection,
    })),
  { ssr: false }
);

const SourcesSection = dynamic(
  () =>
    import("./SourcesSection").then((m) => ({
      default: m.SourcesSection,
    })),
  { ssr: false }
);

export function AgentProtocolsPost() {
  return (
    <>
      <ReadingProgress />
      <div className="max-w-none">
        <HeroSection />
        <TableOfContents />
        <WhyThisMattersSection />
        <ProtocolExplainerSection />
        <LiveDemoSection />
        <ArchitectureSection />
        <CareerImpactSection />
        <SourcesSection />
      </div>
    </>
  );
}
