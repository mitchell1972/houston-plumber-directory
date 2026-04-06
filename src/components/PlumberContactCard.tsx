"use client";

import { trackCallPlumber, trackVisitWebsite } from "@/lib/analytics";

type Props = {
  name: string;
  slug: string;
  phone: string;
  website?: string;
};

export default function PlumberContactCard({ name, slug, phone, website }: Props) {
  return (
    <div className="bg-white rounded-lg border p-6 text-center">
      <h3 className="font-bold text-lg mb-4">Contact {name}</h3>
      <a
        href={`tel:${phone}`}
        onClick={() => trackCallPlumber(name, slug, "plumber_page")}
        className="block bg-green-600 text-white py-3 rounded font-bold text-lg hover:bg-green-700 transition"
      >
        {phone}
      </a>
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackVisitWebsite(name, slug)}
          className="block mt-3 border border-blue-600 text-blue-600 py-3 rounded font-bold hover:bg-blue-50 transition"
        >
          Visit Website
        </a>
      )}
    </div>
  );
}
