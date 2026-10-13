import { ImageResponse } from "next/og";

// The card shown when a link to the site is shared (WhatsApp, LinkedIn, Slack, X…)
export const alt =
  "Hariprasath Periyasamy, Principal Engineer. Frontend, all the way down. AI and full stack, all the way across.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0F1012";
const TEXT = "#E8F5ED";
const MUTED = "#9AA39D";
const GOLD = "#F4D35E";
const CORAL = "#FFB399";
const MINT = "#9EFFBF";

// Google serves TTF to clients that don't advertise woff2 support, which is
// the format the image renderer needs.
async function loadFont(family: string, weight: number, text: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`
    ).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const headline = "Frontend, all the way down. AI and full stack, all the way across.";
  const small = "HARIPRASATH PERIYASAMY · PRINCIPAL ENGINEER irah.dev AUTODESK SHOPIFY AWS 10+ YEARS";

  const [bold, mono] = await Promise.all([
    loadFont("Space Grotesk", 700, headline),
    loadFont("JetBrains Mono", 500, small),
  ]);
  const fonts = [
    ...(bold ? [{ name: "Display", data: bold, weight: 700 as const, style: "normal" as const }] : []),
    ...(mono ? [{ name: "Mono", data: mono, weight: 500 as const, style: "normal" as const }] : []),
  ];

  const word = (text: string, color: string) => (
    <span style={{ color, borderBottom: `8px solid ${color}`, paddingBottom: 2 }}>{text}</span>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          color: TEXT,
          padding: "64px 72px",
          fontFamily: "Display",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Mono",
            fontSize: 24,
            letterSpacing: 5,
            color: MUTED,
          }}
        >
          HARIPRASATH PERIYASAMY · PRINCIPAL ENGINEER
        </div>

        <div style={{ display: "flex", alignItems: "stretch" }}>
          {/* The T: applied AI and full stack across, frontend down */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 170, marginRight: 56 }}>
            <div style={{ display: "flex", width: 170, height: 38 }}>
              <div style={{ display: "flex", width: 85, height: 38, background: CORAL }} />
              <div style={{ display: "flex", width: 85, height: 38, background: MINT }} />
            </div>
            <div style={{ display: "flex", width: 46, flexGrow: 1, background: GOLD }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", fontSize: 61, fontWeight: 700, lineHeight: 1.22 }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              {word("Frontend", GOLD)}
              <span>, all the way down.</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", marginTop: 14 }}>
              {word("AI", CORAL)}
              <span style={{ margin: "0 18px" }}>and</span>
              {word("full stack", MINT)}
              <span>, all the</span>
            </div>
            <div style={{ display: "flex", marginTop: 14 }}>way across.</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Mono",
            fontSize: 24,
            letterSpacing: 4,
            color: MUTED,
          }}
        >
          <span>10+ YEARS · AUTODESK · SHOPIFY · AWS</span>
          <span style={{ color: TEXT }}>irah.dev</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined }
  );
}
