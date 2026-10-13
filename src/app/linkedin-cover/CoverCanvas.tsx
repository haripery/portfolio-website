"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

const BANNER_W = 1584;
const BANNER_H = 396;

type Props = {
  name: string;
  tagline: string;
  blog: string;
  location: string;
  status: string;
};

export function CoverCanvas({
  name,
  tagline,
  blog,
  location,
  status,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!ref.current) return;
    setDownloading(true);
    try {
      // Temporarily hide safe zones during export
      const wasShowingZones = showSafeZones;
      setShowSafeZones(false);
      // Wait for re-render
      await new Promise((r) => setTimeout(r, 50));

      const dataUrl = await toPng(ref.current, {
        width: BANNER_W,
        height: BANNER_H,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#F7F7F5",
      });
      const link = document.createElement("a");
      link.download = "hari-linkedin-cover.png";
      link.href = dataUrl;
      link.click();

      setShowSafeZones(wasShowingZones);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Check console for details.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 print:hidden">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-60"
          style={{
            backgroundColor: "#1A3C2B",
            color: "#F7F7F5",
            border: "1px solid #1A3C2B",
          }}
        >
          {downloading ? "Rendering..." : "↓ Download PNG (1584×396)"}
        </button>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showSafeZones}
            onChange={(e) => setShowSafeZones(e.target.checked)}
            style={{ accentColor: "#FF8C69" }}
          />
          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "rgba(58,58,56,0.7)" }}
          >
            Show safe zones
          </span>
        </label>
      </div>

      {/* Preview: responsive scaled view of the actual 1584x396 element */}
      <div
        className="relative w-full border"
        style={{
          maxWidth: `${BANNER_W}px`,
          aspectRatio: `${BANNER_W} / ${BANNER_H}`,
          borderColor: "rgba(58,58,56,0.2)",
          overflow: "hidden",
        }}
      >
        <ScaledStage>
          <CoverContent
            innerRef={ref}
            name={name}
            tagline={tagline}
            blog={blog}
            location={location}
            status={status}
            showSafeZones={showSafeZones}
          />
        </ScaledStage>
      </div>

      {/* Legend for safe zones */}
      {showSafeZones && (
        <div
          className="flex flex-wrap gap-5 text-xs font-mono uppercase tracking-widest print:hidden"
          style={{ color: "rgba(58,58,56,0.7)" }}
        >
          <div className="flex items-center gap-2">
            <span
              style={{
                display: "inline-block",
                width: "16px",
                height: "2px",
                border: "1px dashed rgba(255,70,70,0.8)",
              }}
            />
            Profile pic overlap (mobile)
          </div>
          <div className="flex items-center gap-2">
            <span
              style={{
                display: "inline-block",
                width: "16px",
                height: "2px",
                border: "1px dashed rgba(70,200,70,0.8)",
              }}
            />
            Safe zone (1350×220)
          </div>
          <div className="flex items-center gap-2">
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "12px",
                backgroundColor: "rgba(70,100,255,0.6)",
              }}
            />
            Mobile crop lines
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Keeps the inner child at its native 1584x396 size but visually scales it
 * to fit the parent's width using CSS transform. The ref-attached element
 * stays at full size so html-to-image exports at correct resolution.
 */
function ScaledStage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <div
        ref={(el) => {
          if (!el) return;
          const parent = el.parentElement;
          if (!parent) return;
          const resize = () => {
            const scale = parent.clientWidth / BANNER_W;
            el.style.transform = `scale(${scale})`;
          };
          resize();
          const ro = new ResizeObserver(resize);
          ro.observe(parent);
        }}
        style={{
          width: `${BANNER_W}px`,
          height: `${BANNER_H}px`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function CoverContent({
  innerRef,
  name,
  tagline,
  blog,
  location,
  status,
  showSafeZones,
}: {
  innerRef: React.RefObject<HTMLDivElement | null>;
  name: string;
  tagline: string;
  blog: string;
  location: string;
  status: string;
  showSafeZones: boolean;
}) {
  return (
    <div
      ref={innerRef}
      style={{
        width: `${BANNER_W}px`,
        height: `${BANNER_H}px`,
        backgroundColor: "#F7F7F5",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ─── Subtle grid texture ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(26,60,43,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(26,60,43,0.035) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* ─── Coral L-corners ─── */}
      <CornerL position="tl" />
      <CornerL position="tr" />
      <CornerL position="bl" />
      <CornerL position="br" />

      {/* ─── Primary content: top-center tagline ─── */}
      <div
        style={{
          position: "absolute",
          top: "44px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          width: "100%",
        }}
      >
        {/* Section label in coral */}
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "#FF8C69",
            margin: 0,
          }}
        >
          · Applied AI · Fullstack · Frontend ·
        </p>

        {/* Main tagline */}
        <h1
          style={{
            fontFamily: "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
            fontSize: "58px",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "#1A3C2B",
            margin: "18px 0 0 0",
            lineHeight: 1.05,
          }}
        >
          {tagline}
        </h1>

      </div>

      {/* ─── Bottom-right: Hari | iraH.dev + status ─── */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          right: "96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#1A3C2B",
              lineHeight: 1,
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
              fontSize: "28px",
              fontWeight: 300,
              color: "#FF8C69",
              lineHeight: 1,
            }}
          >
            |
          </span>
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#FF8C69",
              lineHeight: 1,
            }}
          >
            iraH.dev
          </span>
        </div>

        {/* Status badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid rgba(58,58,56,0.18)",
            padding: "5px 10px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              backgroundColor: "#9EFFBF",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "rgba(58,58,56,0.6)",
            }}
          >
            {status}
          </span>
        </div>
      </div>

      {/* ─── Top-right: blog + location ─── */}
      <div
        style={{
          position: "absolute",
          top: "32px",
          right: "96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "24px", height: "1px", backgroundColor: "#FF8C69" }} />
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(58,58,56,0.55)",
            }}
          >
            {blog}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "24px", height: "1px", backgroundColor: "transparent" }} />
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
              fontSize: "10px",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(58,58,56,0.42)",
            }}
          >
            {location}
          </span>
        </div>
      </div>

      {/* ─── Top-left: logo mark ─── */}
      <div
        style={{
          position: "absolute",
          top: "32px",
          left: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "44px",
          height: "44px",
          backgroundColor: "#1A3C2B",
          borderRadius: "6px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "#9EFFBF",
            lineHeight: 1,
          }}
        >
          H
        </span>
      </div>

      {/* ─── Safe zone overlays ─── */}
      {showSafeZones && (
        <>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "568px",
              height: "264px",
              border: "2px dashed rgba(255, 70, 70, 0.8)",
              backgroundColor: "rgba(255, 70, 70, 0.08)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "88px",
              left: "117px",
              width: "1350px",
              height: "220px",
              border: "2px dashed rgba(70, 200, 70, 0.8)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "238px",
              width: "1px",
              height: "100%",
              backgroundColor: "rgba(70, 100, 255, 0.6)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "1346px",
              width: "1px",
              height: "100%",
              backgroundColor: "rgba(70, 100, 255, 0.6)",
              pointerEvents: "none",
            }}
          />
        </>
      )}
    </div>
  );
}

function CornerL({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const size = 28;
  const thickness = 2;
  const color = "#FF8C69";
  const pos: Record<typeof position, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };
  return (
    <div style={{ position: "absolute", ...pos[position], width: size, height: size }}>
      <div
        style={{
          position: "absolute",
          width: size,
          height: thickness,
          backgroundColor: color,
          ...pos[position],
        }}
      />
      <div
        style={{
          position: "absolute",
          width: thickness,
          height: size,
          backgroundColor: color,
          ...pos[position],
        }}
      />
    </div>
  );
}
