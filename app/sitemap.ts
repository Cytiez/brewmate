import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`,        lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${siteUrl}/terms`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
