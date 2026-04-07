import PlumberCard from "@/components/PlumberCard";
import QuoteForm from "@/components/QuoteForm";
import Link from "next/link";
import { plumbers, services, areas } from "@/data/plumbers";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does a plumber cost in Houston?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most Houston plumbers charge $75-150 for a service call, plus parts and labor. Emergency and after-hours calls may cost more. Drain cleaning typically costs $100-300, while water heater replacement runs $800-2,500 depending on the unit.",
      },
    },
    {
      "@type": "Question",
      name: "How do I find a licensed plumber in Houston?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All plumbers listed on HoustonPlumberPros are licensed and insured. You can also verify a plumber's license through the Texas State Board of Plumbing Examiners.",
      },
    },
    {
      "@type": "Question",
      name: "Do Houston plumbers offer free estimates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most plumbers listed here offer free estimates for major repairs and installations. Some charge a diagnostic fee for service calls, which is typically waived if you proceed with the repair.",
      },
    },
    {
      "@type": "Question",
      name: "Can I get an emergency plumber in Houston 24/7?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Several plumbers in our directory offer 24/7 emergency service for burst pipes, sewage backups, flooding, and other urgent issues. Use our quote form for fastest response.",
      },
    },
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HoustonPlumberPros",
  url: "https://houstonplumberdirectory.com",
  description: "Find licensed, insured plumbers in Houston, TX. Compare ratings, read reviews, and get free quotes.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://houstonplumberdirectory.com/services/{search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  const premiumPlumbers = plumbers.filter((p) => p.premium);
  const regularPlumbers = plumbers.filter((p) => !p.premium);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* Hero */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Find a Trusted Plumber in <span className="text-yellow-400">Houston, TX</span>
              </h1>
              <p className="text-blue-200 mt-4 text-lg">
                Compare {plumbers.length}+ licensed plumbers. Read verified reviews. Get free quotes in minutes. Emergency plumbers available 24/7.
              </p>
              <div className="flex gap-4 mt-8">
                <Link href="/get-quote" className="bg-yellow-400 text-blue-900 px-6 py-3 rounded font-bold hover:bg-yellow-300 transition">
                  Get Free Quote
                </Link>
                <a href="#directory" className="border border-white px-6 py-3 rounded font-bold hover:bg-white/10 transition">
                  Browse Plumbers
                </a>
              </div>
              <div className="flex gap-6 mt-8 text-sm text-blue-200">
                <span>&#10003; All Licensed &amp; Insured</span>
                <span>&#10003; Free Estimates</span>
                <span>&#10003; 24/7 Emergency</span>
              </div>
            </div>
            <div>
              <QuoteForm source="homepage-hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-center text-sm text-gray-600">
          <div><span className="block text-2xl font-bold text-blue-900">{plumbers.length}+</span>Licensed Plumbers</div>
          <div><span className="block text-2xl font-bold text-blue-900">{plumbers.reduce((a, p) => a + p.reviewCount, 0).toLocaleString()}+</span>Verified Reviews</div>
          <div><span className="block text-2xl font-bold text-blue-900">24/7</span>Emergency Service</div>
          <div><span className="block text-2xl font-bold text-blue-900">100%</span>Free Quotes</div>
        </div>
      </section>

      {/* Directory listing */}
      <section id="directory" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Top Rated Houston Plumbers</h2>
        <p className="text-gray-600 mb-8">Featured plumbers are verified, top-rated professionals with premium profiles.</p>

        {/* Featured / Premium */}
        <div className="space-y-4 mb-8">
          {premiumPlumbers.map((p) => (
            <PlumberCard key={p.id} plumber={p} />
          ))}
        </div>

        {/* Regular listings */}
        <h3 className="text-xl font-bold text-gray-800 mb-4 mt-12">All Houston Plumbers</h3>
        <div className="space-y-4">
          {regularPlumbers.map((p) => (
            <PlumberCard key={p.id} plumber={p} />
          ))}
        </div>
      </section>

      {/* Services section for SEO */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Plumbing Services in Houston</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition text-center"
              >
                <h3 className="font-bold text-blue-900">{s.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Houston, TX</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Areas for SEO */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Areas We Serve in Houston</h2>
        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <span key={area} className="bg-white border border-gray-200 px-3 py-1 rounded text-sm text-gray-700">
              Plumber in {area}
            </span>
          ))}
        </div>
      </section>

      {/* FAQ for SEO */}
      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg">How much does a plumber cost in Houston?</h3>
              <p className="text-gray-600 mt-1">Most Houston plumbers charge $75-150 for a service call, plus parts and labor. Emergency and after-hours calls may cost more. Drain cleaning typically costs $100-300, while water heater replacement runs $800-2,500 depending on the unit.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg">How do I find a licensed plumber in Houston?</h3>
              <p className="text-gray-600 mt-1">All plumbers listed on HoustonPlumberPros are licensed and insured. You can also verify a plumber&apos;s license through the Texas State Board of Plumbing Examiners.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg">Do Houston plumbers offer free estimates?</h3>
              <p className="text-gray-600 mt-1">Most plumbers listed here offer free estimates for major repairs and installations. Some charge a diagnostic fee for service calls, which is typically waived if you proceed with the repair.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg">Can I get an emergency plumber in Houston 24/7?</h3>
              <p className="text-gray-600 mt-1">Yes. Several plumbers in our directory offer 24/7 emergency service for burst pipes, sewage backups, flooding, and other urgent issues. Use our quote form for fastest response.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Plumber Right Now?</h2>
          <p className="text-blue-200 mb-6">Get matched with a licensed Houston plumber in minutes. Free quotes, no obligation.</p>
          <Link href="/get-quote" className="bg-yellow-400 text-blue-900 px-8 py-4 rounded font-bold text-lg hover:bg-yellow-300 transition inline-block">
            Get Your Free Quote
          </Link>
        </div>
      </section>

      {/* For Plumbers CTA */}
      <section className="bg-gray-100 border-t border-gray-200 py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-wide text-blue-700 font-semibold">Are you a Houston plumber?</p>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mt-2 mb-3">List your business — get more calls</h2>
          <p className="text-gray-700 mb-6">Claim your free listing or upgrade to Featured ($29/mo) for top placement on city + service pages.</p>
          <Link href="/list-your-business" className="bg-blue-900 text-white px-8 py-4 rounded font-bold hover:bg-blue-800 transition inline-block">
            List Your Business
          </Link>
        </div>
      </section>
    </>
  );
}
