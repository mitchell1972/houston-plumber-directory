import Link from "next/link";
import { Plumber } from "@/data/plumbers";
import PlumberCallButton from "./PlumberCallButton";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating} ({rating > 0 ? `${Math.round(rating * 20)}%` : "N/A"})</span>
    </div>
  );
}

export default function PlumberCard({ plumber }: { plumber: Plumber }) {
  return (
    <div className={`border rounded-lg p-6 hover:shadow-lg transition ${plumber.premium ? "border-yellow-400 bg-yellow-50 relative" : "border-gray-200 bg-white"}`}>
      {plumber.premium && (
        <span className="absolute -top-3 left-4 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">
          FEATURED
        </span>
      )}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Link href={`/plumber/${plumber.slug}`}>
            <h3 className="text-xl font-bold text-blue-900 hover:text-blue-700 transition">
              {plumber.name}
            </h3>
          </Link>
          <Stars rating={plumber.rating} />
          <p className="text-sm text-gray-500 mt-1">{plumber.reviewCount} reviews &middot; {plumber.yearsInBusiness} years in business</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <PlumberCallButton name={plumber.name} slug={plumber.slug} phone={plumber.phone} source="plumber_card" />
          <div className="mt-2 flex gap-2 justify-end">
            {plumber.licensed && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Licensed</span>}
            {plumber.insured && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Insured</span>}
          </div>
        </div>
      </div>
      <p className="text-gray-600 mt-3 text-sm">{plumber.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {plumber.services.slice(0, 4).map((service) => (
          <span key={service} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {service}
          </span>
        ))}
        {plumber.services.length > 4 && (
          <span className="text-xs text-gray-500">+{plumber.services.length - 4} more</span>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">Serving: {plumber.areas.slice(0, 3).join(", ")}{plumber.areas.length > 3 ? ` +${plumber.areas.length - 3} more` : ""}</p>
    </div>
  );
}
