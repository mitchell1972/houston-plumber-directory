import { NextResponse } from "next/server";
import { seoAreas, seoServices, seoProblems } from "@/data/seo-data";

const INDEXNOW_KEY = "7f4a7e20eb3075081b0f37df9dd9367e";
const HOST = "houstonplumberdirectory.com";
const BASE_URL = `https://${HOST}`;
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_ENDPOINTS = [
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];
const BATCH_SIZE = 5_000;

function buildAllUrls(): string[] {
  const urls: string[] = [];

  // Homepage
  urls.push(BASE_URL);

  // Service + area pages: /services/[serviceSlug]/[areaSlug]
  for (const service of seoServices) {
    for (const area of seoAreas) {
      urls.push(`${BASE_URL}/services/${service.slug}/${area.slug}`);
    }
  }

  // Problem + area pages: /problems/[problemSlug]/[areaSlug]
  for (const problem of seoProblems) {
    for (const area of seoAreas) {
      urls.push(`${BASE_URL}/problems/${problem.slug}/${area.slug}`);
    }
  }

  // Plumber-in area pages: /plumber-in/[areaSlug]
  for (const area of seoAreas) {
    urls.push(`${BASE_URL}/plumber-in/${area.slug}`);
  }

  return urls;
}

async function submitBatch(urlList: string[]): Promise<{ engine: string; status: number; count: number }[]> {
  const body = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const results: { engine: string; status: number; count: number }[] = [];
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    results.push({ engine: endpoint, status: response.status, count: urlList.length });
  }
  return results;
}

export async function GET() {
  try {
    const allUrls = buildAllUrls();
    const results: { batch: number; submissions: { engine: string; status: number; count: number }[] }[] = [];

    for (let i = 0; i < allUrls.length; i += BATCH_SIZE) {
      const batch = allUrls.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const submissions = await submitBatch(batch);
      results.push({ batch: batchNumber, submissions });
    }

    return NextResponse.json({
      success: true,
      totalUrls: allUrls.length,
      batches: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
