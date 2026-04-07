import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <Link href="/" className="text-xl md:text-2xl font-bold whitespace-nowrap">
          Houston<span className="text-yellow-400">Plumber</span>Pros
        </Link>
        <nav className="hidden md:flex gap-6 text-sm">
          <Link href="/" className="hover:text-yellow-400 transition">Home</Link>
          <Link href="/services/emergency-plumber" className="hover:text-yellow-400 transition">Emergency</Link>
          <Link href="/services/drain-cleaning" className="hover:text-yellow-400 transition">Drain Cleaning</Link>
          <Link href="/services/water-heater-repair" className="hover:text-yellow-400 transition">Water Heaters</Link>
          <Link href="/list-your-business" className="hover:text-yellow-400 transition">For Plumbers</Link>
          <Link href="/get-quote" className="bg-yellow-400 text-blue-900 px-4 py-2 rounded font-bold hover:bg-yellow-300 transition">
            Get Free Quote
          </Link>
        </nav>
        {/* Mobile nav: compact links so plumbers can find the claim flow */}
        <nav className="flex md:hidden items-center gap-3 text-xs">
          <Link href="/list-your-business" className="hover:text-yellow-400 transition whitespace-nowrap">
            For Plumbers
          </Link>
          <Link href="/get-quote" className="bg-yellow-400 text-blue-900 px-3 py-2 rounded font-bold hover:bg-yellow-300 transition whitespace-nowrap">
            Get Quote
          </Link>
        </nav>
      </div>
    </header>
  );
}
