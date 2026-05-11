// Single source of truth for the site URL. Normalizes common user input
// shapes ("brewmate-zeta.vercel.app", "http://...", trailing slash, etc.) so
// `new URL(getSiteUrl())` never throws at build time.

const DEFAULT_DEV = "http://localhost:3000";

function normalize(raw: string | undefined | null): string {
  const trimmed = (raw ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) return DEFAULT_DEV;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Bare hostname → assume HTTPS (it's a production deployment).
  return `https://${trimmed}`;
}

export function getSiteUrl(): string {
  return normalize(process.env.NEXT_PUBLIC_SITE_URL);
}
