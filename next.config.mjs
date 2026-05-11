import nextPwa from "next-pwa";
import bundleAnalyzer from "@next/bundle-analyzer";

const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev,
});

const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

// CSP — strict but pragmatic. 'unsafe-inline' on script is required by Next 14's
// inline bootstrap; can be upgraded to a per-request nonce later via middleware.
// `connect-src` lists the only outbound origins our client makes calls to.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://openrouter.ai https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options",            value: "DENY" },
  { key: "X-Content-Type-Options",     value: "nosniff" },
  { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security",  value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy",    value: csp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-switch",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
      "@radix-ui/react-tooltip",
      "sonner",
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// `next-pwa` is a webpack plugin and Turbopack ignores it (warns in dev). Only
// wrap in production builds so dev stops complaining and runs faster.
const composed = isProd ? withPWA(nextConfig) : nextConfig;
export default withAnalyzer(composed);
