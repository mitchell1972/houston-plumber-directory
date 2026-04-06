import { notFound } from "next/navigation";
import { seoAreas, seoServices, seoProblems, getAreaBySlug } from "@/data/seo-data";
import { generateAreaLandingContent } from "@/lib/content-engine";
import { plumbers } from "@/data/plumbers";
import PlumberCard from "@/components/PlumberCard";
import QuoteForm from "@/components/QuoteForm";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return seoAreas.map((a) => ({ areaSlug: a.slug }));
}

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ areaSlug: string }>;
}): Promise<Metadata> {
  const { areaSlug } = await params;
  const area = getAreaBySlug(areaSlug);
  if (!area) return { title: "Not Found" };

  const title = `Plumbers in ${area.name}, Houston TX | Licensed & Insured ${area.zipCode}`;
  const description = `Find the best plumbers in ${area.name}, Houston TX (${area.zipCode}). Specialists in ${area.housingEra}-era homes with ${area.commonPipeType} pipes. ${area.soilType} soil experts. Free quotes from licensed, insured pros.`;

  return {
    title,
    description,
    alternates: { canonical: `/plumber-in/${areaSlug}` },
    openGraph: {
      title: `Best Plumbers in ${area.name}, Houston TX`,
      description,
      type: "website",
    },
  };
}

export default async function AreaLandingPage({
  params,
}: {
  params: Promise<{ areaSlug: string }>;
}) {
  const { areaSlug } = await params;
  const area = getAreaBySlug(areaSlug);
  if (!area) notFound();

  const content = generateAreaLandingContent(area);
  const displayPlumbers = plumbers.slice(0, 6);

  // Pick top services and problems relevant to this area
  const topServices = seoServices.slice(0, 8);
  const topProblems = seoProblems
    .sort((a, b) => {
      const urgencyOrder = { "call-now": 0, "same-day": 1, "this-week": 2, "when-convenient": 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    })
    .slice(0, 8);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Houston Plumber Directory - ${area.name}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: area.name,
      addressRegion: "TX",
      postalCode: area.zipCode,
      addressCountry: "US",
    },
    areaServed: {
      "@type": "Place",
      name: `${area.name}, Houston, TX`,
    },
    description: `Licensed plumber directory for ${area.name}, Houston TX. Connecting homeowners with verified plumbing professionals since 2020.`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Houston Plumbers", item: "https://houstonplumberdirectory.com" },
      { "@type": "ListItem", position: 2, name: area.name, item: `https://houstonplumberdirectory.com/plumber-in/${area.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-blue-300 text-sm mb-4">
            <Link href="/" className="hover:text-white">Houston Plumbers</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{area.name}</span>
          </nav>
          <h1 className="text-4xl font-bold">Plumbers in {area.name}, Houston TX</h1>
          <p className="text-blue-200 mt-3 text-lg max-w-2xl">
            Licensed and insured plumbers serving {area.name} ({area.zipCode}). Experts in {area.housingEra}-era {area.commonPipeType} plumbing systems.
          </p>
          <div className="flex flex-wrap gap-3 mt-4 text-sm">
            <span className="bg-blue-800 px-3 py-1 rounded">{area.county} County</span>
            <span className="bg-blue-800 px-3 py-1 rounded">{area.housingEra} Homes</span>
            <span className="bg-blue-800 px-3 py-1 rounded">{area.commonPipeType}</span>
            <span className="bg-blue-800 px-3 py-1 rounded">{area.soilType} Soil</span>
            <span className="bg-blue-800 px-3 py-1 rounded">{area.waterHardness} Water</span>
            <span className="bg-blue-800 px-3 py-1 rounded">{area.floodRisk} Flood Risk</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Area overview */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">About {area.name}</h2>
            <p className="text-gray-600 leading-relaxed">{content[0]}</p>
          </div>

          {/* Plumbing challenges */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Plumbing Challenges in {area.name}</h2>
            <p className="text-gray-600 leading-relaxed">{content[1]}</p>
          </div>

          {/* Home profile */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Typical {area.name} Home Plumbing Profile</h2>
            <p className="text-gray-700 leading-relaxed">{content[2]}</p>
          </div>

          {/* Services grid */}
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Plumbing Services in {area.name}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {topServices.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}/${area.slug}`}
                  className="bg-white rounded-lg border p-4 hover:border-blue-500 transition"
                >
                  <h3 className="font-bold text-blue-900">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.shortDesc}</p>
                  <p className="text-sm text-green-700 font-medium mt-2">${s.avgCostLow}-${s.avgCostHigh}</p>
                </Link>
              ))}
            </div>
            <Link href="#all-services" className="text-blue-600 hover:underline text-sm mt-3 block">
              View all {seoServices.length} services in {area.name} &rarr;
            </Link>
          </div>

          {/* Problems grid */}
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Common Plumbing Problems in {area.name}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {topProblems.map((p) => {
                const urgencyColors: Record<string, string> = {
                  "call-now": "text-red-600",
                  "same-day": "text-orange-600",
                  "this-week": "text-yellow-700",
                  "when-convenient": "text-green-700",
                };
                return (
                  <Link
                    key={p.slug}
                    href={`/problems/${p.slug}/${area.slug}`}
                    className="bg-white rounded-lg border p-4 hover:border-blue-500 transition"
                  >
                    <h3 className="font-bold text-blue-900">{p.name}</h3>
                    <p className={`text-xs font-bold ${urgencyColors[p.urgency]} mt-1`}>
                      {p.urgency.replace("-", " ").toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description.slice(0, 100)}...</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Plumbers */}
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Top-Rated Plumbers Serving {area.name}</h2>
            <div className="space-y-4">
              {displayPlumbers.map((p) => (
                <PlumberCard key={p.id} plumber={p} />
              ))}
            </div>
          </div>

          {/* All services list for internal linking */}
          <div id="all-services" className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">All Plumbing Services in {area.name}</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
              {seoServices.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}/${area.slug}`} className="text-blue-600 hover:underline text-sm py-1">
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-4 space-y-6">
            <QuoteForm source={`area-${area.slug}`} />

            {/* Area stats */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold text-blue-900 mb-3">{area.name} at a Glance</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">County</dt><dd className="font-medium">{area.county}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Zip Code</dt><dd className="font-medium">{area.zipCode}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Home Era</dt><dd className="font-medium">{area.housingEra}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Avg Home Age</dt><dd className="font-medium">{area.avgHomeAge} yrs</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Pipe Type</dt><dd className="font-medium">{area.commonPipeType}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Soil Type</dt><dd className="font-medium capitalize">{area.soilType}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Water Hardness</dt><dd className="font-medium capitalize">{area.waterHardness}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Flood Risk</dt><dd className="font-medium capitalize">{area.floodRisk}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Value Tier</dt><dd className="font-medium capitalize">{area.valueTier}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Landmark</dt><dd className="font-medium text-right max-w-[150px]">{area.nearbyLandmark}</dd></div>
              </dl>
            </div>

            {/* Nearby areas */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold text-blue-900 mb-3">Nearby Houston Areas</h3>
              <ul className="space-y-2">
                {seoAreas
                  .filter((a) => a.county === area.county && a.slug !== area.slug && a.region === area.region)
                  .slice(0, 8)
                  .map((a) => (
                    <li key={a.slug}>
                      <Link href={`/plumber-in/${a.slug}`} className="text-blue-600 hover:underline text-sm">
                        Plumbers in {a.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
