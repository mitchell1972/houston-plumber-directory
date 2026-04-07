import Link from "next/link";
import { services, areas } from "@/data/plumbers";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">HoustonPlumberPros</h3>
          <p className="text-sm">
            Houston&apos;s trusted plumber directory. Find licensed, insured plumbers near you. Free quotes, verified reviews.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Services</h4>
          <ul className="space-y-2 text-sm">
            {services.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-yellow-400 transition">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Areas We Cover</h4>
          <ul className="space-y-2 text-sm">
            {areas.slice(0, 8).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">For Plumbers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/list-your-business" className="hover:text-yellow-400 transition">Claim Your Listing</Link></li>
            <li><Link href="/list-your-business#pricing" className="hover:text-yellow-400 transition">Premium Listings</Link></li>
            <li><Link href="/list-your-business" className="hover:text-yellow-400 transition">Advertising</Link></li>
          </ul>
          <p className="text-xs mt-6 text-gray-500">&copy; {new Date().getFullYear()} HoustonPlumberPros. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
