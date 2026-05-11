import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  // Preview deployments and non-prod environments should never be indexed.
  const isPreview = process.env.VERCEL_ENV !== "production";
  if (isPreview) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms"],
        // Logged-in pages have nothing to index.
        disallow: ["/home", "/beans", "/equipment", "/log", "/history", "/api", "/auth"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
