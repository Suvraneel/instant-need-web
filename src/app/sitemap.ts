import type { MetadataRoute } from "next";

/**
 * Static sitemap for all publicly crawlable routes.
 *
 * Dynamic product/category URLs (e.g. /products/[slug]) could be fetched
 * from the API here; for now we only include the known static paths.
 * To add dynamic entries: fetch slugs from the catalog API and map them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/home`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  return staticRoutes;
}
