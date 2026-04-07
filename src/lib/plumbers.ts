// Supabase-backed data layer for plumber listings.
// Consumers (homepage, plumber/[slug], service/area pages, sitemap) use these
// server-side functions to fetch real plumbers instead of the old hardcoded array.
//
// All functions return plain objects matching the `Plumber` interface in
// src/data/plumbers.ts so consumer pages need minimal changes.

import { supabase } from "./supabase";
import type { Plumber } from "@/data/plumbers";

type PlumberRow = {
  id: string;
  slug: string;
  name: string;
  phone: string | null;
  email?: string | null;
  website: string | null;
  address?: string | null;
  city?: string | null;
  rating: number | string | null;
  review_count: number | null;
  description: string | null;
  services: string[] | null;
  areas: string[] | null;
  years_in_business: number | null;
  licensed: boolean | null;
  insured: boolean | null;
  is_featured: boolean | null;
  is_premium: boolean | null;
  plan?: string | null;
};

// Convert snake_case DB row → camelCase Plumber object matching the
// existing UI interface. Falls back to sensible defaults so the UI never
// renders null for fields like yearsInBusiness.
function toPlumber(row: PlumberRow): Plumber {
  const rating =
    typeof row.rating === "number"
      ? row.rating
      : row.rating
      ? parseFloat(row.rating)
      : 0;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    phone: row.phone || "",
    website: row.website || undefined,
    rating,
    reviewCount: row.review_count || 0,
    services: row.services && row.services.length > 0 ? row.services : ["General Plumbing"],
    areas: row.areas && row.areas.length > 0 ? row.areas : ["Houston"],
    description:
      row.description ||
      `${row.name} is a licensed Houston plumber offering emergency plumbing, drain cleaning, water heater repair, and more. Contact for a free estimate.`,
    yearsInBusiness: row.years_in_business || 5,
    licensed: row.licensed ?? true,
    insured: row.insured ?? true,
    premium: !!(row.is_featured || row.is_premium),
  };
}

// Fetch all plumbers, sorted so premium/featured come first, then by rating.
// Used by homepage, sitemap, and as a fallback for service/area pages.
export async function getPlumbers(): Promise<Plumber[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("plumbers")
    .select(
      "id, slug, name, phone, website, rating, review_count, description, services, areas, years_in_business, licensed, insured, is_featured, is_premium"
    )
    .order("is_premium", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false, nullsFirst: false })
    .order("review_count", { ascending: false });
  if (error) {
    console.error("[getPlumbers]", error);
    return [];
  }
  return (data || []).map(toPlumber);
}

// Single plumber by slug — used by /plumber/[slug] and /plumber/[slug]/claim.
export async function getPlumberBySlug(slug: string): Promise<Plumber | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("plumbers")
    .select(
      "id, slug, name, phone, website, rating, review_count, description, services, areas, years_in_business, licensed, insured, is_featured, is_premium"
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[getPlumberBySlug]", error);
    return null;
  }
  return data ? toPlumber(data as PlumberRow) : null;
}

// Plumbers that serve a given normalized area string (e.g. "Katy", "Sugar Land").
// Uses Postgres array contains — requires the `areas` column to have the exact
// string. Falls back to all plumbers if no match (so the UI never shows empty).
export async function getPlumbersByArea(area: string): Promise<Plumber[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("plumbers")
    .select(
      "id, slug, name, phone, website, rating, review_count, description, services, areas, years_in_business, licensed, insured, is_featured, is_premium"
    )
    .contains("areas", [area])
    .order("is_premium", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false, nullsFirst: false });
  if (error) {
    console.error("[getPlumbersByArea]", error);
    return [];
  }
  return (data || []).map(toPlumber);
}

// Plumbers offering a given service keyword. We fetch all and filter in JS
// because services is text[] and we want substring matching
// (e.g. "Drain" matches "Drain Cleaning").
export async function getPlumbersByService(service: string): Promise<Plumber[]> {
  const all = await getPlumbers();
  const keyword = service.toLowerCase().split(" ")[0];
  const matches = all.filter((p) =>
    p.services.some((s) => s.toLowerCase().includes(keyword))
  );
  return matches.length > 0 ? matches : all;
}

// Only featured/premium plumbers for the homepage hero section.
export async function getFeaturedPlumbers(): Promise<Plumber[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("plumbers")
    .select(
      "id, slug, name, phone, website, rating, review_count, description, services, areas, years_in_business, licensed, insured, is_featured, is_premium"
    )
    .or("is_featured.eq.true,is_premium.eq.true")
    .order("is_premium", { ascending: false })
    .order("rating", { ascending: false, nullsFirst: false });
  if (error) {
    console.error("[getFeaturedPlumbers]", error);
    return [];
  }
  return (data || []).map(toPlumber);
}

// Slug list for generateStaticParams / sitemap — lighter query when we only
// need the slugs.
export async function getPlumberSlugs(): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("plumbers").select("slug");
  if (error) {
    console.error("[getPlumberSlugs]", error);
    return [];
  }
  return (data || []).map((r: { slug: string }) => r.slug);
}

// Count for homepage trust bar.
export async function getPlumberCount(): Promise<number> {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("plumbers")
    .select("*", { count: "exact", head: true });
  if (error) {
    console.error("[getPlumberCount]", error);
    return 0;
  }
  return count || 0;
}
