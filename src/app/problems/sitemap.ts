import { seoAreas, seoProblems } from "@/data/seo-data";
import type { MetadataRoute } from "next";

const BASE_URL = "https://houstonplumberdirectory.com";

// All problem+area URLs in one sitemap (~9,825 URLs)
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  for (const problem of seoProblems) {
    for (const area of seoAreas) {
      urls.push({
        url: `${BASE_URL}/problems/${problem.slug}/${area.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return urls;
}
