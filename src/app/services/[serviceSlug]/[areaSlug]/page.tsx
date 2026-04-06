import { notFound } from "next/navigation";
import { seoAreas, seoServices, getAreaBySlug, getServiceBySlug } from "@/data/seo-data";
import { generateServiceAreaContent } from "@/lib/content-engine";
import { plumbers } from "@/data/plumbers";
import PlumberCard from "@/components/PlumberCard";
import QuoteForm from "@/components/QuoteForm";
import Link from "next/link";
import type { Metadata } from "next";

// Pre-render top 50 combinations at build time; rest generated on-demand via ISR
export async function generateStaticParams() {
  const params: { serviceSlug: string; areaSlug: string }[] = [];
  const topAreas = seoAreas.slice(0, 10); // Inner-loop neighborhoods
  const topServices = seoServices.slice(0, 5); // Most popular services
  for (const service of topServices) {
    for (const area of topAreas) {
      params.push({ serviceSlug: service.slug, areaSlug: area.slug });
    }
  }
  return params;
}

export const dynamicParams = true;
export const revalidate = 86400; // Revalidate every 24 hours

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string; areaSlug: string }>;
}): Promise<Metadata> {
  const { serviceSlug, areaSlug } = await params;
  const service = getServiceBySlug(serviceSlug);
  const area = getAreaBySlug(areaSlug);
  if (!service || !area) return { title: "Not Found" };

  const title = `${service.name} in ${area.name}, Houston TX | Licensed Plumbers ${area.zipCode}`;
  const description = `Need ${service.name.toLowerCase()} in ${area.name}? Compare ${area.name}'s top-rated licensed plumbers. ${area.housingEra}-era homes with ${area.commonPipeType} pipes. Free quotes in ${area.zipCode}.`;

  return {
    title,
    description,
    alternates: { canonical: `/services/${serviceSlug}/${areaSlug}` },
    openGraph: {
      title: `${service.name} in ${area.name}, Houston TX`,
      description,
      type: "website",
    },
  };
}

export default async function ServiceAreaPage({
  params,
}: {
  params: Promise<{ serviceSlug: string; areaSlug: string }>;
}) {
  const { serviceSlug, areaSlug } = await params;
  const service = getServiceBySlug(serviceSlug);
  const area = getAreaBySlug(areaSlug);
  if (!service || !area) notFound();

  const content = generateServiceAreaContent(area, service);

  // Match plumbers by service keyword
  const keyword = service.name.toLowerCase().split(" ")[0];
  const matchingPlumbers = plumbers.filter((p) =>
    p.services.some((s) => s.toLowerCase().includes(keyword))
  );
  const displayPlumbers = matchingPlumbers.length > 0 ? matchingPlumbers : plumbers.slice(0, 5);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    provider: {
      "@type": "LocalBusiness",
      name: "HoustonPlumberPros",
      address: {
        "@type": "PostalAddress",
        addressLocality: area.name,
        addressRegion: "TX",
        postalCode: area.zipCode,
        addressCountry: "US",
      },
    },
    areaServed: {
      "@type": "Place",
      name: `${area.name}, Houston, TX`,
      address: {
        "@type": "PostalAddress",
        addressLocality: area.name,
        addressRegion: "TX",
        postalCode: area.zipCode,
      },
    },
    description: service.shortDesc,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: service.avgCostLow,
      highPrice: service.avgCostHigh,
      priceCurrency: "USD",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Houston Plumbers", item: "https://houstonplumberdirectory.com" },
      { "@type": "ListItem", position: 2, name: service.name, item: `https://houstonplumberdirectory.com/services/${service.slug}` },
      { "@type": "ListItem", position: 3, name: area.name, item: `https://houstonplumberdirectory.com/services/${service.slug}/${area.slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much does ${service.name.toLowerCase()} cost in ${area.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${service.name} in ${area.name} typically costs between $${service.avgCostLow} and $${service.avgCostHigh}. Pricing varies based on the ${area.housingEra}-era homes common in this area and the ${area.commonPipeType} plumbing systems used.`,
        },
      },
      {
        "@type": "Question",
        name: `What causes ${service.name.toLowerCase()} problems in ${area.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `In ${area.name}, ${service.name.toLowerCase()} issues are commonly caused by ${service.commonCauses.slice(0, 3).join(", ")}. The area's ${area.soilType} soil and ${area.waterHardness} water hardness also contribute.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I find a ${service.name.toLowerCase()} plumber near ${area.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Use our directory to compare licensed plumbers serving ${area.name} (${area.zipCode}). All listed plumbers are verified, insured, and experienced with ${area.housingEra}-era homes in the ${area.region.replace("-", " ")} area.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-blue-300 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/services/${service.slug}`} className="hover:text-white">{service.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{area.name}</span>
          </nav>
          <h1 className="text-4xl font-bold">{service.name} in {area.name}, Houston TX</h1>
          <p className="text-blue-200 mt-3 text-lg max-w-2xl">{service.shortDesc} for {area.name} homes in {area.zipCode}.</p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="bg-blue-800 px-3 py-1 rounded">{area.housingEra} Homes</span>
            <span className="bg-blue-800 px-3 py-1 rounded">{area.commonPipeType}</span>
            <span className="bg-blue-800 px-3 py-1 rounded">{area.floodRisk} Flood Risk</span>
            <span className="bg-blue-800 px-3 py-1 rounded">${service.avgCostLow}-${service.avgCostHigh}</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Unique content sections */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">{service.name} for {area.name} Homes</h2>
            <p className="text-gray-600 leading-relaxed">{content[0]}</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Why {area.name} Needs {service.name}</h2>
            <p className="text-gray-600 leading-relaxed">{content[1]}</p>
          </div>

          {/* Signs you need this service */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Signs You Need {service.name} in {area.name}</h2>
            <ul className="space-y-2">
              {service.signs.map((sign, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <span className="text-red-500 mt-1">!</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cost section */}
          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <h2 className="text-xl font-bold text-green-900 mb-3">{service.name} Cost in {area.name}</h2>
            <p className="text-gray-700 leading-relaxed">{content[2]}</p>
          </div>

          {/* What to expect */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">What to Expect from {service.name} Service</h2>
            <ol className="space-y-2">
              {service.whatToExpect.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <span className="bg-blue-100 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Local considerations */}
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-3">Local Plumbing Considerations in {area.name}</h2>
            <p className="text-gray-700 leading-relaxed">{content[3]}</p>
          </div>

          {/* Prevention tips */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Prevention Tips for {area.name} Homeowners</h2>
            <ul className="space-y-2">
              {service.preventionTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <span className="text-green-500">&#10003;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plumbers */}
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Top {service.name} Plumbers Serving {area.name}
            </h2>
            <div className="space-y-4">
              {displayPlumbers.map((p) => (
                <PlumberCard key={p.id} plumber={p} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-4 space-y-6">
            <QuoteForm source={`service-${service.slug}-${area.slug}`} />

            {/* Area quick facts */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold text-blue-900 mb-3">{area.name} Quick Facts</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Zip Code</dt><dd className="font-medium">{area.zipCode}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Avg Home Age</dt><dd className="font-medium">{area.avgHomeAge} years</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Common Pipes</dt><dd className="font-medium">{area.commonPipeType}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Soil Type</dt><dd className="font-medium capitalize">{area.soilType}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Water Hardness</dt><dd className="font-medium capitalize">{area.waterHardness}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Flood Risk</dt><dd className="font-medium capitalize">{area.floodRisk}</dd></div>
              </dl>
            </div>

            {/* Related services */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold text-blue-900 mb-3">Related Services in {area.name}</h3>
              <ul className="space-y-2">
                {seoServices
                  .filter((s) => s.category === service.category && s.slug !== service.slug)
                  .slice(0, 5)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}/${area.slug}`} className="text-blue-600 hover:underline text-sm">
                        {s.name} in {area.name}
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
