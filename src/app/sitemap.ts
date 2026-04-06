import { plumbers, services } from "@/data/plumbers";
import { seoAreas, seoServices, seoProblems } from "@/data/seo-data";
import type { MetadataRoute } from "next";

const BASE_URL = "https://houstonplumberdirectory.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Original plumber pages
  const plumberPages = plumbers.map((p) => ({
    url: `${BASE_URL}/plumber/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Original service pages
  const servicePages = services.map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Area landing pages (400)
  const areaPages = seoAreas.map((a) => ({
    url: `${BASE_URL}/plumber-in/${a.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Service + Area pages (25 x 400 = 10,000)
  const serviceAreaPages: MetadataRoute.Sitemap = [];
  for (const service of seoServices) {
    for (const area of seoAreas) {
      serviceAreaPages.push({
        url: `${BASE_URL}/services/${service.slug}/${area.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      });
    }
  }

  // Problem + Area pages (25 x 400 = 10,000)
  const problemAreaPages: MetadataRoute.Sitemap = [];
  for (const problem of seoProblems) {
    for (const area of seoAreas) {
      problemAreaPages.push({
        url: `${BASE_URL}/problems/${problem.slug}/${area.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      });
    }
  }

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/get-quote`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...servicePages,
    ...plumberPages,
    ...areaPages,
    ...serviceAreaPages,
    ...problemAreaPages,
  ];
}
