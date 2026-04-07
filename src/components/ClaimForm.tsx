"use client";

import { useState } from "react";
import { trackClaimSubmit } from "@/lib/analytics";

type Props = {
  type?: "claim" | "new_listing";
  plumberSlug?: string;
  defaultBusinessName?: string;
  defaultPlan?: "free" | "featured" | "premium";
};

export default function ClaimForm({
  type = "claim",
  plumberSlug,
  defaultBusinessName = "",
  defaultPlan = "featured",
}: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<"free" | "featured" | "premium">(defaultPlan);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      type,
      plumberSlug,
      businessName: (form.elements.namedItem("businessName") as HTMLInputElement).value,
      ownerName: (form.elements.namedItem("ownerName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
      plan,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const claimRes = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const claimJson = await claimRes.json().catch(() => ({}));
      trackClaimSubmit(plan, type, plumberSlug);

      // For paid plans, redirect to Stripe Checkout
      if (plan === "featured" || plan === "premium") {
        const checkoutRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan,
            claimId: claimJson.id,
            email: data.email,
            plumberSlug, // threaded into Stripe metadata so webhook can upgrade the right listing
          }),
        });
        const checkoutJson = await checkoutRes.json();
        if (checkoutJson.url) {
          window.location.href = checkoutJson.url;
          return;
        }
        // Stripe not configured yet — fall through to thank-you screen
      }
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please email us at hello@houstonplumberdirectory.com");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-2xl font-bold text-green-800">Request Received!</h3>
        <p className="text-green-700 mt-2">
          Thanks! We&apos;ll verify your business and get back to you within 1 business day to activate your listing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-blue-900">
        {type === "claim" ? "Claim This Listing" : "List Your Plumbing Business"}
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
        <input
          name="businessName"
          type="text"
          required
          defaultValue={defaultBusinessName}
          className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
          <input name="ownerName" type="text" required className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input name="phone" type="tel" required className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Email *</label>
          <input name="email" type="email" required className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input name="website" type="url" placeholder="https://" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Choose Your Plan *</label>
        <div className="grid md:grid-cols-3 gap-3">
          {(["free", "featured", "premium"] as const).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPlan(p)}
              className={`text-left border-2 rounded-lg p-3 transition ${
                plan === p ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-bold capitalize">{p}</div>
              <div className="text-xs text-gray-500">
                {p === "free" && "$0/mo"}
                {p === "featured" && "$29/mo"}
                {p === "premium" && "$99/mo"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Anything else? (optional)</label>
        <textarea name="message" rows={3} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-900 text-white py-3 rounded font-bold text-lg hover:bg-blue-800 transition disabled:opacity-50"
      >
        {loading ? "Submitting..." : type === "claim" ? "Claim My Listing" : "Submit Listing Request"}
      </button>
      <p className="text-xs text-gray-400 text-center">
        We&apos;ll verify your business before activating. No payment required upfront — we&apos;ll invoice you after activation.
      </p>
    </form>
  );
}
