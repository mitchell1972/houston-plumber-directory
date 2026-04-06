import type { Metadata } from "next";
import ClaimForm from "@/components/ClaimForm";

export const metadata: Metadata = {
  title: "List Your Plumbing Business | Houston Plumber Directory",
  description:
    "Get your Houston plumbing business in front of homeowners actively searching for help. Free, Featured, and Premium listings available.",
  alternates: { canonical: "/list-your-business" },
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    features: [
      "Basic listing with name & phone",
      "Appears in search results",
      "Click-to-call button",
      "Service category tags",
    ],
    cta: "Start Free",
    plan: "free" as const,
  },
  {
    name: "Featured",
    price: "$29",
    period: "/month",
    highlight: true,
    badge: "MOST POPULAR",
    features: [
      "Everything in Free",
      "⭐ Top placement above free listings",
      "📸 Photos of your work & team",
      "📝 Full business description",
      "🏆 Featured badge for trust",
      "🔗 Link to your website (SEO boost)",
      "🕐 Display business hours",
    ],
    cta: "Get Featured",
    plan: "featured" as const,
  },
  {
    name: "Premium",
    price: "$99",
    period: "/month",
    highlight: false,
    badge: "BEST VALUE",
    features: [
      "Everything in Featured",
      "🎯 Only 3 premium spots per ZIP",
      "📊 Lead tracking dashboard",
      "✍️ Verified customer reviews",
      "🎥 Video introduction",
      "📧 Direct lead forms",
      "🚨 24/7 emergency badge",
      "🗺️ Service area map",
    ],
    cta: "Go Premium",
    plan: "premium" as const,
  },
];

export default function ListYourBusinessPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900">
          Get Found by Houston Homeowners
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
          Join hundreds of Houston plumbers getting real leads from real customers — without the cost of Yelp Ads or
          HomeAdvisor.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 max-w-3xl mx-auto">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-900">15,000+</div>
            <div className="text-sm text-gray-600">Monthly visitors searching for plumbers</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-900">$200+</div>
            <div className="text-sm text-gray-600">Average value of one plumbing job</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-900">1 lead</div>
            <div className="text-sm text-gray-600">Pays for a year of Featured listing</div>
          </div>
        </div>
      </div>

      {/* Pricing tiers */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-lg border-2 p-6 ${
              tier.highlight ? "border-yellow-400 shadow-xl scale-105 bg-white" : "border-gray-200 bg-white"
            }`}
          >
            {tier.badge && (
              <span
                className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${
                  tier.highlight ? "bg-yellow-400 text-blue-900" : "bg-blue-900 text-white"
                }`}
              >
                {tier.badge}
              </span>
            )}
            <h2 className="text-2xl font-bold text-blue-900">{tier.name}</h2>
            <div className="mt-2">
              <span className="text-4xl font-bold">{tier.price}</span>
              <span className="text-gray-500">{tier.period}</span>
            </div>
            <ul className="mt-6 space-y-2">
              {tier.features.map((f) => (
                <li key={f} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#claim-form"
              className={`block text-center mt-6 py-3 rounded font-bold transition ${
                tier.highlight
                  ? "bg-yellow-400 text-blue-900 hover:bg-yellow-300"
                  : "bg-blue-900 text-white hover:bg-blue-800"
              }`}
            >
              {tier.cta}
            </a>
          </div>
        ))}
      </div>

      {/* Why us */}
      <div className="bg-gray-50 rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
          Why Houston Plumbers Choose Us Over Yelp & HomeAdvisor
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-lg mb-2">💰 Up to 10x cheaper</h3>
            <p className="text-gray-600 text-sm">
              Yelp Ads cost $300–$1,000+/month. HomeAdvisor charges $15–$100 per lead — even bad ones. Our Featured plan
              is just $29/month.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">📞 You own the customer</h3>
            <p className="text-gray-600 text-sm">
              Customers call you directly. No middleman, no shared leads sent to 5 competitors at the same time.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">🎯 Houston-only traffic</h3>
            <p className="text-gray-600 text-sm">
              Every visitor is searching for a Houston plumber. No wasted impressions on people 500 miles away.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">🚫 No long-term contracts</h3>
            <p className="text-gray-600 text-sm">
              Cancel any time. Try Featured for one month — if you don&apos;t get a single lead, we&apos;ll refund you.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-blue-900 text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <details className="bg-white border border-gray-200 rounded p-4">
            <summary className="font-bold cursor-pointer">How do you verify my business?</summary>
            <p className="text-sm text-gray-600 mt-2">
              We check your Texas plumbing license number, call the business phone, and verify the address. Usually
              takes 1 business day.
            </p>
          </details>
          <details className="bg-white border border-gray-200 rounded p-4">
            <summary className="font-bold cursor-pointer">Do I have to pay upfront?</summary>
            <p className="text-sm text-gray-600 mt-2">
              No. We invoice you monthly after activation. You can cancel any time before the next billing date.
            </p>
          </details>
          <details className="bg-white border border-gray-200 rounded p-4">
            <summary className="font-bold cursor-pointer">What if I don&apos;t get any leads?</summary>
            <p className="text-sm text-gray-600 mt-2">
              We offer a 30-day money-back guarantee on Featured and Premium plans. If you get zero qualified leads in
              your first month, we&apos;ll refund you.
            </p>
          </details>
          <details className="bg-white border border-gray-200 rounded p-4">
            <summary className="font-bold cursor-pointer">Can I upgrade or downgrade later?</summary>
            <p className="text-sm text-gray-600 mt-2">
              Yes, change your plan any time. Upgrades are prorated; downgrades take effect at the next billing cycle.
            </p>
          </details>
        </div>
      </div>

      {/* Form */}
      <div id="claim-form" className="max-w-2xl mx-auto scroll-mt-20">
        <h2 className="text-2xl font-bold text-blue-900 text-center mb-6">Get Listed Today</h2>
        <ClaimForm type="new_listing" />
      </div>
    </div>
  );
}
