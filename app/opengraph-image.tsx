import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Brewmate — a quiet brew journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Edge-rendered OG image. Uses system serif via @font-face fallback — the
// Fraunces variable axes aren't available in the edge runtime without fetching
// the WOFF2, but the system serif on most platforms is fine for OG.
export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F6F1E7",
          color: "#1A1612",
          padding: "72px 80px",
          fontFamily: "ui-serif, Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "ui-monospace, monospace",
            fontSize: 18,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#6B645B",
          }}
        >
          <span style={{ display: "block", height: 1, width: 56, backgroundColor: "#B0A189" }} />
          <span>Brewmate · 日録</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 132, lineHeight: 0.96, letterSpacing: "-0.02em", display: "flex", flexDirection: "column" }}>
            <span>A quiet</span>
            <span style={{ fontStyle: "italic" }}>brew journal.</span>
          </div>
          <div
            style={{
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 28,
              color: "#4C4640",
              maxWidth: 720,
              lineHeight: 1.35,
            }}
          >
            Log the variables. Read the patterns. Dial it in.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "ui-monospace, monospace",
            fontSize: 16,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#6B645B",
          }}
        >
          <span>for home brewers</span>
          <span style={{ color: "#BA4026" }}>brewmate</span>
        </div>
      </div>
    ),
    size,
  );
}
