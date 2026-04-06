import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://houstonplumberdirectory.com"),
  title: {
    default: "Find a Plumber in Houston TX | HoustonPlumberPros",
    template: "%s | HoustonPlumberPros",
  },
  description: "Find licensed, insured plumbers in Houston, TX. Compare ratings, read reviews, and get free quotes. Emergency plumbers available 24/7.",
  keywords: "plumber houston, plumber near me, houston plumber, emergency plumber houston, drain cleaning houston, water heater repair houston",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HoustonPlumberPros",
    title: "Find a Plumber in Houston TX | HoustonPlumberPros",
    description: "Find licensed, insured plumbers in Houston, TX. Compare ratings, read reviews, and get free quotes. Emergency plumbers available 24/7.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find a Plumber in Houston TX | HoustonPlumberPros",
    description: "Find licensed, insured plumbers in Houston, TX. Compare ratings, read reviews, and get free quotes.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <GoogleAnalytics />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
