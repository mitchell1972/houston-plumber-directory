import { notFound } from "next/navigation";
import { services, plumbers } from "@/data/plumbers";
import PlumberCard from "@/components/PlumberCard";
import QuoteForm from "@/components/QuoteForm";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return { title: "Service Not Found" };
  return {
    title: `${service.name} Houston TX | Best ${service.name} Services`,
    description: service.description,
    alternates: {
      canonical: `/services/${slug}`,
    },
    openGraph: {
      title: `${service.name} in Houston, TX`,
      description: service.description,
      type: "website",
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const serviceName = service.name;
  const matchingPlumbers = plumbers.filter((p) =>
    p.services.some((s) => s.toLowerCase().includes(serviceName.toLowerCase().split(" ")[0]))
  );
  const displayPlumbers = matchingPlumbers.length > 0 ? matchingPlumbers : plumbers.slice(0, 5);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: serviceName,
    provider: {
      "@type": "LocalBusiness",
      name: "HoustonPlumberPros",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Houston",
        addressRegion: "TX",
        addressCountry: "US",
      },
    },
    areaServed: {
      "@type": "City",
      name: "Houston",
      containedInPlace: {
        "@type": "State",
        name: "Texas",
      },
    },
    description: service.description,
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
        name: serviceName,
        item: `https://houstonplumberdirectory.com/services/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold">{serviceName} in Houston, TX</h1>
          <p className="text-blue-200 mt-3 text-lg max-w-2xl">{service.description}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Top {serviceName} Plumbers in Houston
          </h2>
          <div className="space-y-4">
            {displayPlumbers.map((p) => (
              <PlumberCard key={p.id} plumber={p} />
            ))}
          </div>

          {/* SEO content */}
          <div className="bg-white rounded-lg border p-6 mt-8">
            <h2 className="text-xl font-bold mb-3">About {serviceName} in Houston</h2>
            <p className="text-gray-600 mb-4">
              Looking for professional {serviceName.toLowerCase()} services in Houston, TX? Our directory connects you with licensed and insured plumbers who specialize in {serviceName.toLowerCase()}. All plumbers in our network are verified, reviewed by real customers, and committed to quality service.
            </p>
            <h3 className="font-bold mb-2">What to Expect</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Free estimates from licensed Houston plumbers</li>
              <li>Same-day service availability</li>
              <li>Upfront pricing with no hidden fees</li>
              <li>Warranty on parts and labor</li>
              <li>Background-checked, insured professionals</li>
            </ul>
          </div>
        </div>

        <div>
          <div className="sticky top-4">
            <QuoteForm source={`service-${slug}`} />
          </div>
        </div>
      </div>
    </>
  );
}
