"use client";

import dynamic from "next/dynamic";
import { ReadingProgress } from "./shared/ReadingProgress";
import { TableOfContents } from "./shared/TableOfContents";
import { HeroSection } from "./HeroSection";

const CanvaSection = dynamic(
  () => import("./CanvaSection").then((m) => ({ default: m.CanvaSection })),
  { ssr: false }
);
const ShopifySection = dynamic(
  () => import("./ShopifySection").then((m) => ({ default: m.ShopifySection })),
  { ssr: false }
);
const MercorSection = dynamic(
  () => import("./MercorSection").then((m) => ({ default: m.MercorSection })),
  { ssr: false }
);
const DuolingoSection = dynamic(
  () => import("./DuolingoSection").then((m) => ({ default: m.DuolingoSection })),
  { ssr: false }
);
const BanningAISection = dynamic(
  () => import("./BanningAISection").then((m) => ({ default: m.BanningAISection })),
  { ssr: false }
);
const WhatThisMeansSection = dynamic(
  () => import("./WhatThisMeansSection").then((m) => ({ default: m.WhatThisMeansSection })),
  { ssr: false }
);
const SourcesSection = dynamic(
  () => import("./SourcesSection").then((m) => ({ default: m.SourcesSection })),
  { ssr: false }
);

export function AIHiringRevolution() {
  return (
    <>
      <ReadingProgress />
      <TableOfContents />
      <div className="max-w-none">
        <HeroSection />
        <CanvaSection />
        <ShopifySection />
        <MercorSection />
        <DuolingoSection />
        <BanningAISection />
        <WhatThisMeansSection />
        <SourcesSection />
      </div>
    </>
  );
}
