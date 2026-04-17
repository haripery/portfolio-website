import type { Metadata } from "next";
import { getProfile } from "@/actions/profile";
import { CardQRCode } from "./QRCode";

export const metadata: Metadata = {
  title: "Business Card",
  robots: "noindex, nofollow",
};

export default async function BusinessCardPage() {
  const profile = await getProfile();

  const role = "Applied AI Fullstack Engineer";
  const email = "hari@irah.dev";
  const linkedin = "linkedin.com/in/hariperiyasamy";
  const blog = "nearthesingularity.com/blog";
  const location = "Nashua, NH";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 p-4 sm:p-8 print:p-0 print:gap-8">
      {/* Print instructions */}
      <div className="text-center max-w-md print:hidden">
        <h1
          className="text-xl sm:text-2xl font-bold tracking-tight mb-2"
          style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif", color: "#1A3C2B" }}
        >
          Business Card
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: "#3A3A38" }}>
          Press <kbd className="px-1.5 py-0.5 border text-xs font-mono" style={{ borderColor: "rgba(58,58,56,0.2)" }}>Cmd + P</kbd> to
          print. Set margins to <strong>None</strong> and enable <strong>Background graphics</strong> for best results.
          Standard size: 3.5&quot; x 2&quot;.
        </p>
      </div>

      {/* ── SINGLE-SIDED CARD ── */}
      <div
        className="card relative border overflow-hidden w-full max-w-[3.5in] aspect-[7/4]"
        style={{
          backgroundColor: "#F7F7F5",
          borderColor: "rgba(58,58,56,0.15)",
          containerType: "inline-size",
        }}
      >
        {/* Coral L-corner — top left */}
        <div className="absolute top-0 left-0">
          <div style={{ width: "16px", height: "2px", backgroundColor: "#FF8C69" }} />
          <div style={{ width: "2px", height: "16px", backgroundColor: "#FF8C69" }} />
        </div>

        {/* Coral L-corner — bottom right */}
        <div className="absolute bottom-0 right-0">
          <div className="absolute bottom-0 right-0" style={{ width: "16px", height: "2px", backgroundColor: "#FF8C69" }} />
          <div className="absolute bottom-0 right-0" style={{ width: "2px", height: "16px", backgroundColor: "#FF8C69" }} />
        </div>

        <div className="flex h-full" style={{ padding: "5.5% 4.5%" }}>
          {/* ── LEFT: Identity ── */}
          <div className="flex flex-col justify-between flex-1">
            {/* Logo + Hari | iraH.dev */}
            <div className="flex items-center" style={{ gap: "3%" }}>
              {/* Favicon logo */}
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: "7cqi",
                  height: "7cqi",
                  backgroundColor: "#0A1A14",
                  borderRadius: "12%",
                }}
              >
                <span
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontSize: "4.8cqi",
                    fontWeight: 700,
                    color: "#9EFFBF",
                    lineHeight: 1,
                  }}
                >
                  H
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
                  fontSize: "6.5cqi",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#1A3C2B",
                  lineHeight: 1,
                }}
              >
                Hari
              </span>
              <span
                style={{
                  fontSize: "6cqi",
                  fontWeight: 200,
                  color: "#FF8C69",
                  lineHeight: 1,
                  margin: "0 0.5%",
                }}
              >
                |
              </span>
              <span
                style={{
                  fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
                  fontSize: "6.5cqi",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#FF8C69",
                  lineHeight: 1,
                }}
              >
                iraH.dev
              </span>
            </div>

            {/* Role */}
            <p
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: "2.8cqi",
                fontWeight: 500,
                color: "rgba(58,58,56,0.6)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {role}
            </p>

            {/* Contact stack */}
            <div className="flex flex-col" style={{ gap: "1.2cqi" }}>
              {[
                { icon: "✉", value: email },
                { icon: "in", value: linkedin },
                { icon: "✎", value: blog },
                { icon: "⌖", value: location },
              ].map(({ icon, value }) => (
                <p
                  key={value}
                  className="flex items-center"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "2.1cqi",
                    fontWeight: 400,
                    color: "rgba(58,58,56,0.5)",
                    margin: 0,
                    letterSpacing: "0.02em",
                    gap: "1.2cqi",
                  }}
                >
                  <span style={{ fontSize: "2.4cqi", width: "3cqi", textAlign: "center", flexShrink: 0 }}>{icon}</span>
                  {value}
                </p>
              ))}
            </div>
          </div>

          {/* ── RIGHT: QR ── */}
          <div
            className="flex flex-col items-center justify-center"
            style={{ width: "28%", gap: "1.5cqi" }}
          >
            <div style={{ padding: "1.2cqi", border: "1px solid rgba(58,58,56,0.1)" }}>
              <CardQRCode url="https://irah.dev" />
            </div>

            {/* Mint status dot + label */}
            <div className="flex items-center" style={{ gap: "1cqi" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "1.5cqi",
                  height: "1.5cqi",
                  backgroundColor: "#9EFFBF",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "1.8cqi",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(58,58,56,0.4)",
                }}
              >
                Scan me
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: 3.5in 2in;
            margin: 0;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .card {
            width: 3.5in !important;
            height: 2in !important;
            max-width: none !important;
            aspect-ratio: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
