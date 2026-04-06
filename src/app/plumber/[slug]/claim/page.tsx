import { notFound } from "next/navigation";
import { plumbers } from "@/data/plumbers";
import ClaimForm from "@/components/ClaimForm";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return plumbers.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plumber = plumbers.find((p) => p.slug === slug);
  if (!plumber) return { title: "Claim Listing" };
  return {
    title: `Claim ${plumber.name} | Houston Plumber Directory`,
    description: `Are you the owner of ${plumber.name}? Claim your listing to add photos, manage info, and get more leads.`,
    robots: { index: false, follow: true },
  };
}

export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plumber = plumbers.find((p) => p.slug === slug);
  if (!plumber) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/plumber/${plumber.slug}`} className="hover:text-blue-600">{plumber.name}</Link>
        <span className="mx-2">/</span>
        <span>Claim</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Claim {plumber.name}</h1>
      <p className="text-gray-600 mt-2">
        Are you the owner or manager of <strong>{plumber.name}</strong>? Claim this listing to take control of your
        business profile.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mt-8 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="font-bold text-blue-900">📸 Add photos</div>
          <p className="text-xs text-gray-600 mt-1">Show off your team, vans, and completed jobs</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="font-bold text-blue-900">📝 Edit your info</div>
          <p className="text-xs text-gray-600 mt-1">Update services, hours, and description</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="font-bold text-blue-900">⭐ Get more leads</div>
          <p className="text-xs text-gray-600 mt-1">Featured listings get 5x more clicks</p>
        </div>
      </div>

      <ClaimForm type="claim" plumberSlug={plumber.slug} defaultBusinessName={plumber.name} defaultPlan="featured" />

      <p className="text-center text-sm text-gray-500 mt-6">
        Want to see plan details first?{" "}
        <Link href="/list-your-business" className="text-blue-600 underline">
          View pricing →
        </Link>
      </p>
    </div>
  );
}
