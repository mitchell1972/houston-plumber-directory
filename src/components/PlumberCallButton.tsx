"use client";

import { trackCallPlumber } from "@/lib/analytics";

type Props = {
  name: string;
  slug: string;
  phone: string;
  source?: string;
  className?: string;
};

export default function PlumberCallButton({ name, slug, phone, source = "plumber_card", className }: Props) {
  return (
    <a
      href={`tel:${phone}`}
      onClick={() => trackCallPlumber(name, slug, source)}
      className={className ?? "bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition text-sm inline-block"}
    >
      {phone}
    </a>
  );
}
