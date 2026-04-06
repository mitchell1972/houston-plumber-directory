import { seoAreas, seoServices } from "@/data/seo-data";
import type { MetadataRoute } from "next";

const BASE_URL = "https://houstonplumberdirectory.com";

// All service+area URLs in one sitemap (~9,825 URLs)
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  for (const service of seoServices) {
    for (const area of seoAreas) {
      urls.push({
        url: `${BASE_URL}/services/${service.slug}/${area.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return urls;
}
