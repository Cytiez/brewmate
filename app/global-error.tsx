"use client";

// Triggers when the root layout itself crashes. No layout, no theme provider —
// must include its own <html> + <body>. Keep it dead-simple.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#F6F1E7",
          color: "#1A1612",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: "#6B645B", marginBottom: 12 }}>
            error · 500
          </div>
          <h1 style={{ fontSize: 28, fontFamily: "ui-serif, Georgia, serif", marginBottom: 12 }}>
            Something brewed wrong.
          </h1>
          <p style={{ fontSize: 14, color: "#4C4640", marginBottom: 24 }}>
            The page failed to load. The error has been logged.
          </p>
          <button
            onClick={reset}
            style={{
              backgroundColor: "#1A1612",
              color: "#F6F1E7",
              padding: "10px 20px",
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              border: 0,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
