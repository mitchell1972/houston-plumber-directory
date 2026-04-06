import { plumbers, services } from "@/data/plumbers";
import { seoAreas } from "@/data/seo-data";
import type { MetadataRoute } from "next";

const BASE_URL = "https://houstonplumberdirectory.com";

// Core sitemap: static pages + plumber pages + original service pages + area landing pages
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/get-quote`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...services.map((s) => ({
      url: `${BASE_URL}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...plumbers.map((p) => ({
      url: `${BASE_URL}/plumber/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...seoAreas.map((a) => ({
      url: `${BASE_URL}/plumber-in/${a.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
