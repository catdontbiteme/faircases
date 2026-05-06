import type { MetadataRoute } from "next";
import { getAllCases } from "@/lib/cases";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const cases = getAllCases();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
  ];
  const caseRoutes: MetadataRoute.Sitemap = cases.map((c) => ({
    url: `${base}/cases/${c.slug}`,
    lastModified: new Date(c.lastUpdated),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [...staticRoutes, ...caseRoutes];
}
