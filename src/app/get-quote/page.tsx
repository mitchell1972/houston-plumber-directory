import QuoteForm from "@/components/QuoteForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Free Plumbing Quote in Houston TX | HoustonPlumberPros",
  description: "Get free plumbing quotes from licensed Houston plumbers. No obligation. Emergency plumbers available 24/7. Compare prices and save.",
};

export default function GetQuotePage() {
  return (
    <>
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Get a Free Plumbing Quote</h1>
          <p className="text-blue-200 mt-3 text-lg">
            Tell us about your plumbing issue and we&apos;ll connect you with a licensed Houston plumber. Most requests get a response within 30 minutes.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <QuoteForm source="get-quote-page" />

        <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-white border rounded-lg p-4">
            <div className="text-3xl mb-2">&#9989;</div>
            <h3 className="font-bold">100% Free</h3>
            <p className="text-sm text-gray-500">No cost, no obligation quotes</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-3xl mb-2">&#9201;</div>
            <h3 className="font-bold">Fast Response</h3>
            <p className="text-sm text-gray-500">Most calls returned in 30 min</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-3xl mb-2">&#128274;</div>
            <h3 className="font-bold">Licensed Only</h3>
            <p className="text-sm text-gray-500">All plumbers are verified</p>
          </div>
        </div>
      </div>
    </>
  );
}
