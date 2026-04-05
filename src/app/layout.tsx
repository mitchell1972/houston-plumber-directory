import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Find a Plumber in Houston TX | HoustonPlumberPros",
  description: "Find licensed, insured plumbers in Houston, TX. Compare ratings, read reviews, and get free quotes. Emergency plumbers available 24/7.",
  keywords: "plumber houston, plumber near me, houston plumber, emergency plumber houston, drain cleaning houston, water heater repair houston",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
