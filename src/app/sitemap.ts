import { services } from "@/data/plumbers";
import { getPlumberSlugs } from "@/lib/plumbers";
import { seoAreas } from "@/data/seo-data";
import type { MetadataRoute } from "next";

const BASE_URL = "https://houstonplumberdirectory.com";

// Regenerate sitemap every hour so new plumber listings appear quickly in search.
export const revalidate = 3600;

// Core sitemap: static pages + plumber pages + original service pages + area landing pages
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const plumberSlugs = await getPlumberSlugs();

  return [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/get-quote`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/list-your-business`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...services.map((s) => ({
      url: `${BASE_URL}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...plumberSlugs.map((slug) => ({
      url: `${BASE_URL}/plumber/${slug}`,
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
