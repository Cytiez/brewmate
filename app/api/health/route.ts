import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Lightweight health endpoint for uptime monitors (Better Stack, Uptime Robot,
// Vercel's own monitor). Does NOT hit the database — we want this to stay green
// even if Supabase is degraded, so we can distinguish "app down" from "DB down".
export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
  });
}
