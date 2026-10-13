import type { Metadata } from "next";
import { CoverCanvas } from "./CoverCanvas";

export const metadata: Metadata = {
  title: "LinkedIn Cover",
  robots: "noindex, nofollow",
};

export default function LinkedInCoverPage() {
  return (
    <div
      className="min-h-screen p-6 sm:p-10"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <div className="max-w-[1584px] mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
            style={{
              fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              color: "#1A3C2B",
            }}
          >
            LinkedIn Cover · 1584 × 396
          </h1>
          <p
            className="text-sm max-w-3xl"
            style={{
              color: "rgba(58,58,56,0.7)",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            Preview is scaled to fit your screen. The exported PNG is the full
            1584×396 LinkedIn spec at 2× pixel density. Click{" "}
            <strong>Show safe zones</strong> to check the profile-pic overlap
            area (red) and the 1350×220 content safe zone (green) — hide before
            downloading.
          </p>
        </div>

        {/* Canvas */}
        <CoverCanvas
          name="Hari"
          tagline="Engineering AI-native products for the web."
          blog="nearthesingularity.com"
          location="Nashua, NH"
          status="Open to interesting conversations"
        />

        {/* Usage notes */}
        <div
          className="border p-5 text-sm"
          style={{
            borderColor: "rgba(58,58,56,0.15)",
            color: "rgba(58,58,56,0.75)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          }}
        >
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              color: "#1A3C2B",
            }}
          >
            Upload to LinkedIn
          </h2>
          <ol className="space-y-1.5 list-decimal list-inside">
            <li>Click <strong>Download PNG</strong> above.</li>
            <li>On LinkedIn, go to your profile → hover the current banner → click the camera icon → <em>Change photo</em>.</li>
            <li>Upload <code>hari-linkedin-cover.png</code> and confirm.</li>
            <li>Check both desktop and mobile views to verify the layout.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
