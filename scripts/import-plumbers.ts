/* eslint-disable no-console */
// Imports 130 scraped Houston plumbers from CSV into Supabase plumbers table.
// Idempotent — uses upsert on place_id so re-running is safe.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... npx tsx scripts/import-plumbers.ts

import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env var");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV = path.join(process.cwd(), "leads", "houston-plumbers-with-emails.csv");

// Default service catalog every general plumber offers — plumbers can edit later
const DEFAULT_SERVICES = [
  "Emergency Plumbing",
  "Drain Cleaning",
  "Water Heater Repair",
  "Leak Detection",
  "Toilet Repair",
];

// Map known cities/suburbs to canonical area names used by the directory
const AREA_NORMALIZE: Record<string, string> = {
  Houston: "Downtown Houston",
  "Houston Heights": "Heights",
  Heights: "Heights",
  Katy: "Katy",
  "Sugar Land": "Sugar Land",
  Pearland: "Pearland",
  Cypress: "Cypress",
  Spring: "Spring",
  Humble: "Humble",
  Kingwood: "Kingwood",
  Bellaire: "Bellaire",
  Pasadena: "Pasadena",
  "League City": "League City",
  "The Woodlands": "The Woodlands",
  "Missouri City": "Sugar Land",
  Tomball: "Spring",
  Atascocita: "Humble",
  Friendswood: "Pearland",
  Webster: "Clear Lake",
  Stafford: "Sugar Land",
  Richmond: "Sugar Land",
  Rosenberg: "Sugar Land",
};

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  const parseLine = (line: string) => {
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = !inQ;
      } else if (c === "," && !inQ) {
        cells.push(cur);
        cur = "";
      } else cur += c;
    }
    cells.push(cur);
    return cells;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] || ""));
    return row;
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function extractCity(address: string): string {
  // "1704 Avenue D, Katy, TX 77493, USA" -> "Katy"
  const parts = address.split(",").map((s) => s.trim());
  return parts[1] || "Houston";
}

function generateDescription(name: string, city: string, years?: number): string {
  const tenure = years ? `with ${years}+ years of experience ` : "";
  return `${name} is a licensed and insured plumber serving ${city} and the greater Houston area ${tenure}— offering emergency plumbing, drain cleaning, water heater repair, leak detection, and more. Contact for a free estimate.`;
}

async function main() {
  console.log("Reading CSV…");
  const text = await readFile(CSV, "utf8");
  const rows = parseCsv(text);
  console.log(`Found ${rows.length} plumbers in CSV`);

  // Build payloads
  const payloads = rows.map((r) => {
    const city = extractCity(r.address);
    const normalizedArea = AREA_NORMALIZE[city] || "Downtown Houston";
    const slug = slugify(r.name);
    return {
      place_id: r.place_id,
      slug,
      name: r.name,
      phone: r.phone,
      email: r.email || null,
      website: r.website || null,
      address: r.address,
      city,
      rating: r.rating ? parseFloat(r.rating) : null,
      review_count: r.review_count ? parseInt(r.review_count, 10) : 0,
      description: generateDescription(r.name, city),
      services: DEFAULT_SERVICES,
      areas: [normalizedArea],
      licensed: true,
      insured: true,
      is_featured: false,
      is_premium: false,
      plan: "free",
      source: "google_places",
    };
  });

  // Dedupe by slug (CSV may have duplicates from name collisions)
  const seen = new Set<string>();
  const unique = payloads.filter((p) => {
    if (seen.has(p.slug)) {
      console.warn(`  duplicate slug: ${p.slug} — skipping`);
      return false;
    }
    seen.add(p.slug);
    return true;
  });
  console.log(`${unique.length} unique by slug`);

  // Upsert in batches
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const { data, error } = await supabase
      .from("plumbers")
      .upsert(batch, { onConflict: "place_id" })
      .select("id");
    if (error) {
      console.error(`Batch ${i}-${i + BATCH} failed:`, error);
      process.exit(1);
    }
    inserted += data?.length || 0;
    console.log(`  upserted ${inserted}/${unique.length}`);
  }

  console.log(`\n✅ Imported ${inserted} plumbers to Supabase`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
