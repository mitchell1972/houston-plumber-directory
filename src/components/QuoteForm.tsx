"use client";

import { useState } from "react";

export default function QuoteForm({ source }: { source?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      service: (form.elements.namedItem("service") as HTMLSelectElement).value,
      zip: (form.elements.namedItem("zip") as HTMLInputElement).value,
      details: (form.elements.namedItem("details") as HTMLTextAreaElement).value,
      source: source || "direct",
    };

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please call us directly.");
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
        <h3 className="text-xl font-bold text-green-800">Quote Request Submitted!</h3>
        <p className="text-green-700 mt-2">A licensed Houston plumber will contact you shortly. Most calls are returned within 30 minutes.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-bold text-blue-900 mb-4">Get a Free Plumbing Quote</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <input name="name" type="text" placeholder="Your Name *" required className="border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input name="phone" type="tel" placeholder="Phone Number *" required className="border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input name="email" type="email" placeholder="Email Address" className="border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input name="zip" type="text" placeholder="Houston ZIP Code *" required pattern="[0-9]{5}" className="border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <select name="service" required className="w-full mt-4 border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">What do you need help with? *</option>
        <option value="emergency">Emergency Plumbing (urgent)</option>
        <option value="drain">Drain Cleaning / Clog</option>
        <option value="water-heater">Water Heater Repair / Install</option>
        <option value="leak">Leak Repair / Detection</option>
        <option value="toilet">Toilet Repair / Install</option>
        <option value="sewer">Sewer Line Issue</option>
        <option value="faucet">Faucet / Fixture Install</option>
        <option value="gas">Gas Line Repair</option>
        <option value="other">Other Plumbing Service</option>
      </select>
      <textarea name="details" placeholder="Describe your plumbing issue (optional)" rows={3} className="w-full mt-4 border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button type="submit" disabled={loading} className="w-full mt-4 bg-green-600 text-white py-3 rounded font-bold text-lg hover:bg-green-700 transition disabled:opacity-50">
        {loading ? "Submitting..." : "Get My Free Quote"}
      </button>
      <p className="text-xs text-gray-400 mt-2 text-center">No obligation. Licensed plumbers only. Your info is never shared with third parties.</p>
    </form>
  );
}
