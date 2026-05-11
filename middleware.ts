import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Skip middleware on API routes (they auth-check themselves), the OAuth/sign-out
// endpoints (they need to write cookies without an auth gate), and anything in
// `public/` or Next's static output.
export const config = {
  matcher: [
    "/((?!api|auth/callback|auth/signout|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-|robots.txt|sitemap.xml|opengraph-image).*)",
  ],
};
