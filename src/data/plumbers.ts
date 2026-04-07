// Static reference data for the directory.
//
// Plumber listings themselves are now stored in Supabase — see src/lib/plumbers.ts
// for the async server-side fetchers (getPlumbers, getPlumberBySlug, etc.).
// This file only keeps the Plumber interface + the static services catalog and
// "areas we serve" list used by navigation / SEO footers.

export interface Plumber {
  id: string;
  name: string;
  slug: string;
  phone: string;
  website?: string;
  rating: number;
  reviewCount: number;
  services: string[];
  areas: string[];
  description: string;
  yearsInBusiness: number;
  licensed: boolean;
  insured: boolean;
  premium: boolean;
  image?: string;
}

export const services = [
  { name: "Emergency Plumbing", slug: "emergency-plumber", description: "24/7 emergency plumbing services for burst pipes, flooding, and urgent repairs in Houston, TX." },
  { name: "Drain Cleaning", slug: "drain-cleaning", description: "Professional drain cleaning and unclogging services in Houston. Hydro jetting and camera inspection available." },
  { name: "Water Heater Repair", slug: "water-heater-repair", description: "Expert water heater repair and installation in Houston. All brands serviced. Same-day appointments." },
  { name: "Sewer Line Repair", slug: "sewer-line-repair", description: "Sewer line repair, replacement, and camera inspection in Houston. Trenchless options available." },
  { name: "Leak Detection", slug: "leak-detection", description: "Professional leak detection services in Houston. Slab leaks, hidden leaks, and pipe leak repair." },
  { name: "Toilet Repair", slug: "toilet-repair", description: "Toilet repair and installation in Houston. Running toilets, clogs, and new toilet installation." },
  { name: "Water Line Repair", slug: "water-line-repair", description: "Water line repair and replacement in Houston. Main water line and supply line services." },
  { name: "Gas Line Repair", slug: "gas-line-repair", description: "Licensed gas line repair and installation in Houston. Gas leak detection and pipe fitting." },
];

export const areas = [
  "Downtown Houston", "Midtown", "Montrose", "Heights", "River Oaks",
  "Katy", "Sugar Land", "The Woodlands", "Pearland", "Cypress",
  "Spring", "Humble", "Kingwood", "Clear Lake", "Bellaire",
  "Memorial", "Galleria", "West University", "Pasadena", "League City",
];
