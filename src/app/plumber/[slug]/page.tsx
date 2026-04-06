import { notFound } from "next/navigation";
import { plumbers } from "@/data/plumbers";
import QuoteForm from "@/components/QuoteForm";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return plumbers.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plumber = plumbers.find((p) => p.slug === slug);
  if (!plumber) return { title: "Plumber Not Found" };
  return {
    title: `${plumber.name} - Houston Plumber | Reviews & Contact`,
    description: `${plumber.name} - Licensed plumber in Houston, TX. ${plumber.rating} stars from ${plumber.reviewCount} reviews. Services: ${plumber.services.join(", ")}. Call ${plumber.phone}.`,
    alternates: {
      canonical: `/plumber/${slug}`,
    },
    openGraph: {
      title: `${plumber.name} - Licensed Houston Plumber`,
      description: `${plumber.rating} stars from ${plumber.reviewCount} reviews. ${plumber.services.slice(0, 3).join(", ")} and more. Call ${plumber.phone}.`,
      type: "website",
    },
  };
}

export default async function PlumberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plumber = plumbers.find((p) => p.slug === slug);
  if (!plumber) notFound();

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Plumber",
    name: plumber.name,
    telephone: plumber.phone,
    url: plumber.website || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Houston",
      addressRegion: "TX",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 29.7604,
      longitude: -95.3698,
    },
    areaServed: plumber.areas.map((area) => ({
      "@type": "City",
      name: area,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: plumber.rating,
      reviewCount: plumber.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Houston Plumbers",
        item: "https://houstonplumberdirectory.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: plumber.name,
        item: `https://houstonplumberdirectory.com/plumber/${plumber.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Houston Plumbers</Link>
        <span className="mx-2">/</span>
        <span>{plumber.name}</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border p-6">
            {plumber.premium && (
              <span className="bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">FEATURED PLUMBER</span>
            )}
            <h1 className="text-3xl font-bold text-blue-900 mt-2">{plumber.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-5 h-5 ${star <= Math.round(plumber.rating) ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-bold">{plumber.rating}</span>
              <span className="text-gray-500">({plumber.reviewCount} reviews)</span>
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded p-3 text-center">
                <div className="text-2xl font-bold text-blue-900">{plumber.yearsInBusiness}</div>
                <div className="text-xs text-gray-500">Years in Business</div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{plumber.licensed ? "Yes" : "No"}</div>
                <div className="text-xs text-gray-500">Licensed</div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{plumber.insured ? "Yes" : "No"}</div>
                <div className="text-xs text-gray-500">Insured</div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-center">
                <div className="text-2xl font-bold text-blue-900">{plumber.reviewCount}</div>
                <div className="text-xs text-gray-500">Reviews</div>
              </div>
            </div>

            {/* About */}
            <h2 className="text-xl font-bold mt-8 mb-2">About {plumber.name}</h2>
            <p className="text-gray-600">{plumber.description}</p>

            {/* Services */}
            <h2 className="text-xl font-bold mt-8 mb-2">Services Offered</h2>
            <div className="flex flex-wrap gap-2">
              {plumber.services.map((s) => (
                <span key={s} className="bg-blue-50 text-blue-800 px-3 py-1 rounded text-sm">{s}</span>
              ))}
            </div>

            {/* Areas */}
            <h2 className="text-xl font-bold mt-8 mb-2">Service Areas</h2>
            <div className="flex flex-wrap gap-2">
              {plumber.areas.map((a) => (
                <span key={a} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">{a}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact card */}
          <div className="bg-white rounded-lg border p-6 text-center">
            <h3 className="font-bold text-lg mb-4">Contact {plumber.name}</h3>
            <a href={`tel:${plumber.phone}`} className="block bg-green-600 text-white py-3 rounded font-bold text-lg hover:bg-green-700 transition">
              {plumber.phone}
            </a>
            {plumber.website && (
              <a href={plumber.website} target="_blank" rel="noopener noreferrer" className="block mt-3 border border-blue-600 text-blue-600 py-3 rounded font-bold hover:bg-blue-50 transition">
                Visit Website
              </a>
            )}
          </div>

          {/* Quote form */}
          <QuoteForm source={`plumber-${plumber.slug}`} />
        </div>
      </div>
    </div>
    </>
  );
}
