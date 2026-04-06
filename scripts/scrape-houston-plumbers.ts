/**
 * Houston Plumber Cold Outreach Scraper
 *
 * Pulls Houston plumbers from Google Places API and outputs a CSV ready for
 * mail merge / cold outreach.
 *
 * Setup:
 *   1. Get a Google Maps API key with "Places API (New)" enabled:
 *      https://console.cloud.google.com/google/maps-apis
 *   2. export GOOGLE_PLACES_API_KEY=AIza...
 *   3. npx tsx scripts/scrape-houston-plumbers.ts
 *
 * Output:
 *   leads/houston-plumbers-outreach.csv
 *
 * Notes:
 *   - Each Text Search request costs ~$0.032 — this script makes ~10 requests = ~$0.32
 *   - Place Details (for emails/websites) are an extra $0.017 per result
 *   - 100 plumbers ≈ $2 total
 *   - Many plumbers won't have an email in Google Places — use the website to find one,
 *     or just send postcards/SMS instead
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY env var");
  process.exit(1);
}

// Houston-area search anchors — covers the metro
const SEARCH_QUERIES = [
  "plumber in Houston, TX",
  "plumber in Katy, TX",
  "plumber in Sugar Land, TX",
  "plumber in The Woodlands, TX",
  "plumber in Pearland, TX",
  "plumber in Spring, TX",
  "plumber in Cypress, TX",
  "plumber in Pasadena, TX",
  "emergency plumber Houston",
  "drain cleaning Houston",
];

type Place = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  primaryType?: string;
};

async function textSearch(query: string): Promise<Place[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.businessStatus,places.primaryType",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
  });
  if (!res.ok) {
    console.error(`Search failed: ${query}`, await res.text());
    return [];
  }
  const data = await res.json();
  return data.places || [];
}

function csvEscape(v: string | number | undefined) {
  if (v === undefined || v === null) return "";
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

async function main() {
  const all = new Map<string, Place>();
  for (const q of SEARCH_QUERIES) {
    console.log(`Searching: ${q}`);
    const places = await textSearch(q);
    for (const p of places) {
      if (p.id && !all.has(p.id)) all.set(p.id, p);
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  const rows = Array.from(all.values()).filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY");
  console.log(`\nFound ${rows.length} unique active plumbers`);

  const header = [
    "place_id",
    "name",
    "address",
    "phone",
    "website",
    "rating",
    "review_count",
    "outreach_url",
  ].join(",");

  const csv = [
    header,
    ...rows.map((p) => {
      const slug = (p.displayName?.text || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const outreachUrl = `https://houstonplumberdirectory.com/list-your-business?utm_source=outreach&utm_campaign=cold_email&ref=${encodeURIComponent(slug)}`;
      return [
        csvEscape(p.id),
        csvEscape(p.displayName?.text),
        csvEscape(p.formattedAddress),
        csvEscape(p.nationalPhoneNumber || p.internationalPhoneNumber),
        csvEscape(p.websiteUri),
        csvEscape(p.rating),
        csvEscape(p.userRatingCount),
        csvEscape(outreachUrl),
      ].join(",");
    }),
  ].join("\n");

  const outDir = path.join(process.cwd(), "leads");
  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, "houston-plumbers-outreach.csv");
  await writeFile(outFile, csv);
  console.log(`\n✅ Saved ${rows.length} plumbers to ${outFile}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Open the CSV in Google Sheets`);
  console.log(`  2. Visit each website to find an email address (or use Hunter.io / Apollo to enrich)`);
  console.log(`  3. Use the templates in scripts/outreach-templates.md`);
  console.log(`  4. Send via Gmail mail merge, Instantly.ai, or Apollo`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
