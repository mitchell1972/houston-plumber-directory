import { notFound } from "next/navigation";
import { seoAreas, seoProblems, getAreaBySlug, getProblemBySlug } from "@/data/seo-data";
import { generateProblemAreaContent } from "@/lib/content-engine";
import { plumbers } from "@/data/plumbers";
import PlumberCard from "@/components/PlumberCard";
import QuoteForm from "@/components/QuoteForm";
import Link from "next/link";
import type { Metadata } from "next";

// Pre-render top 50 combinations at build time; rest generated on-demand via ISR
export async function generateStaticParams() {
  const params: { problemSlug: string; areaSlug: string }[] = [];
  const topAreas = seoAreas.slice(0, 10);
  const topProblems = seoProblems.slice(0, 5);
  for (const problem of topProblems) {
    for (const area of topAreas) {
      params.push({ problemSlug: problem.slug, areaSlug: area.slug });
    }
  }
  return params;
}

export const dynamicParams = true;
export const revalidate = 86400; // Revalidate every 24 hours

export async function generateMetadata({
  params,
}: {
  params: Promise<{ problemSlug: string; areaSlug: string }>;
}): Promise<Metadata> {
  const { problemSlug, areaSlug } = await params;
  const problem = getProblemBySlug(problemSlug);
  const area = getAreaBySlug(areaSlug);
  if (!problem || !area) return { title: "Not Found" };

  const title = `${problem.name} in ${area.name}, Houston TX | ${problem.urgency === "call-now" ? "Emergency" : "Expert"} Help ${area.zipCode}`;
  const description = `${problem.name} in your ${area.name} home? ${area.housingEra}-era ${area.commonPipeType} pipes are ${area.avgHomeAge > 50 ? "especially" : "occasionally"} prone. Get ${problem.urgency === "call-now" ? "emergency" : "fast"} help from licensed plumbers in ${area.zipCode}.`;

  return {
    title,
    description,
    alternates: { canonical: `/problems/${problemSlug}/${areaSlug}` },
    openGraph: {
      title: `${problem.name} in ${area.name} - Houston Plumber Help`,
      description,
      type: "website",
    },
  };
}

export default async function ProblemAreaPage({
  params,
}: {
  params: Promise<{ problemSlug: string; areaSlug: string }>;
}) {
  const { problemSlug, areaSlug } = await params;
  const problem = getProblemBySlug(problemSlug);
  const area = getAreaBySlug(areaSlug);
  if (!problem || !area) notFound();

  const content = generateProblemAreaContent(area, problem);

  const displayPlumbers = plumbers.slice(0, 5);

  const urgencyColors: Record<string, string> = {
    "call-now": "bg-red-600",
    "same-day": "bg-orange-500",
    "this-week": "bg-yellow-500",
    "when-convenient": "bg-green-500",
  };

  const urgencyLabels: Record<string, string> = {
    "call-now": "Call Now - Emergency",
    "same-day": "Same-Day Service Recommended",
    "this-week": "Schedule This Week",
    "when-convenient": "Schedule When Convenient",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What causes ${problem.name.toLowerCase()} in ${area.name} homes?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `In ${area.name}, ${problem.name.toLowerCase()} is commonly caused by ${problem.causes.slice(0, 3).join(", ")}. The area's ${area.housingEra}-era homes with ${area.commonPipeType} plumbing and ${area.soilType} soil conditions make this issue ${area.avgHomeAge > 50 ? "especially common" : "an occasional concern"}.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${problem.name.toLowerCase()} an emergency in ${area.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${problem.urgency === "call-now" ? `Yes, ${problem.name.toLowerCase()} requires immediate professional attention.` : problem.urgency === "same-day" ? `While not always an emergency, same-day service is recommended to prevent further damage to your ${area.name} home.` : `${problem.name} is typically not an emergency but should be addressed within the week to prevent worsening.`} ${problem.healthRisk ? "This issue poses a health risk — take precautions." : ""} ${problem.propertyDamageRisk === "high" ? "Property damage risk is high if left untreated." : ""}`,
        },
      },
      {
        "@type": "Question",
        name: `How much does it cost to fix ${problem.name.toLowerCase()} in ${area.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Cost varies based on severity and the specific ${area.commonPipeType} plumbing in ${area.name}'s ${area.housingEra}-era homes. Related services include ${problem.relatedServices.join(", ")}. Get free quotes from licensed plumbers serving ${area.zipCode} through our directory.`,
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Houston Plumbers", item: "https://houstonplumberdirectory.com" },
      { "@type": "ListItem", position: 2, name: problem.name, item: `https://houstonplumberdirectory.com/problems/${problem.slug}` },
      { "@type": "ListItem", position: 3, name: area.name, item: `https://houstonplumberdirectory.com/problems/${problem.slug}/${area.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-blue-300 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/plumber-in/${area.slug}`} className="hover:text-white">{area.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{problem.name}</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <span className={`${urgencyColors[problem.urgency]} text-white text-xs font-bold px-3 py-1 rounded-full`}>
              {urgencyLabels[problem.urgency]}
            </span>
            {problem.healthRisk && (
              <span className="bg-red-800 text-white text-xs font-bold px-3 py-1 rounded-full">Health Risk</span>
            )}
          </div>
          <h1 className="text-4xl font-bold">{problem.name} in {area.name}, Houston TX</h1>
          <p className="text-blue-200 mt-3 text-lg max-w-2xl">
            Expert help for {problem.name.toLowerCase()} in {area.name}&apos;s {area.housingEra}-era homes. Property damage risk: {problem.propertyDamageRisk}.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Problem overview for this area */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">{problem.name} in {area.name} Homes</h2>
            <p className="text-gray-600 leading-relaxed">{content[0]}</p>
          </div>

          {/* Why this area has this problem */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Why {area.name} Homes Experience {problem.name}</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">{content[1]}</div>
          </div>

          {/* Common causes */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Common Causes of {problem.name}</h2>
            <ul className="space-y-2">
              {problem.causes.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <span className="text-red-500 mt-1">&#8226;</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick fixes */}
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-3">What You Can Try Before Calling a Plumber</h2>
            <ol className="space-y-2">
              {problem.quickFixes.map((fix, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="bg-amber-200 text-amber-900 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                  <span>{fix}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* When to call a pro */}
          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <h2 className="text-xl font-bold text-red-900 mb-3">When to Call a {area.name} Plumber</h2>
            <p className="text-gray-700 leading-relaxed">{problem.whenToCallPro}</p>
          </div>

          {/* Local advice */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Advice for {area.name} Residents</h2>
            <p className="text-gray-700 leading-relaxed">{content[2]}</p>
          </div>

          {/* Plumbers */}
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Plumbers Serving {area.name} for {problem.name}
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
            <QuoteForm source={`problem-${problem.slug}-${area.slug}`} />

            {/* Problem severity card */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold text-blue-900 mb-3">Problem Assessment</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Urgency</dt>
                  <dd className={`${urgencyColors[problem.urgency]} text-white text-xs font-bold px-2 py-1 rounded`}>
                    {problem.urgency.replace("-", " ").toUpperCase()}
                  </dd>
                </div>
                <div className="flex justify-between"><dt className="text-gray-500">Health Risk</dt><dd className="font-medium">{problem.healthRisk ? "Yes" : "No"}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Property Damage</dt><dd className="font-medium capitalize">{problem.propertyDamageRisk}</dd></div>
              </dl>
            </div>

            {/* Area info */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold text-blue-900 mb-3">{area.name} Home Profile</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Zip Code</dt><dd className="font-medium">{area.zipCode}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Home Era</dt><dd className="font-medium">{area.housingEra}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Pipe Type</dt><dd className="font-medium">{area.commonPipeType}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Soil</dt><dd className="font-medium capitalize">{area.soilType}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Water</dt><dd className="font-medium capitalize">{area.waterHardness}</dd></div>
              </dl>
            </div>

            {/* Related problems */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold text-blue-900 mb-3">Related Problems in {area.name}</h3>
              <ul className="space-y-2">
                {seoProblems
                  .filter((p) => p.slug !== problem.slug)
                  .filter((p) => p.relatedServices.some((rs) => problem.relatedServices.includes(rs)))
                  .slice(0, 5)
                  .map((p) => (
                    <li key={p.slug}>
                      <Link href={`/problems/${p.slug}/${area.slug}`} className="text-blue-600 hover:underline text-sm">
                        {p.name} in {area.name}
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
