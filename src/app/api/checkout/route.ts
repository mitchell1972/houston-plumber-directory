import { NextRequest, NextResponse } from "next/server";

// Stripe Checkout Session creation.
// Required env vars (set in Vercel):
//   STRIPE_SECRET_KEY              — sk_live_... or sk_test_...
//   STRIPE_PRICE_FEATURED          — price_... ($29/mo recurring)
//   STRIPE_PRICE_PREMIUM           — price_... ($99/mo recurring)
//   NEXT_PUBLIC_SITE_URL           — https://houstonplumberdirectory.com

const PRICE_IDS: Record<string, string | undefined> = {
  featured: process.env.STRIPE_PRICE_FEATURED,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const plan = body.plan as "featured" | "premium";
  const claimId = body.claimId as string | undefined;
  const email = body.email as string | undefined;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = PRICE_IDS[plan];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://houstonplumberdirectory.com";

  if (!secretKey || !priceId) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_* env vars." },
      { status: 500 }
    );
  }

  // Use Stripe REST API directly to avoid adding the SDK dependency
  const params = new URLSearchParams();
  params.append("mode", "subscription");
  params.append("line_items[0][price]", priceId);
  params.append("line_items[0][quantity]", "1");
  params.append("success_url", `${siteUrl}/list-your-business?success=1&session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", `${siteUrl}/list-your-business?canceled=1`);
  params.append("allow_promotion_codes", "true");
  if (email) params.append("customer_email", email);
  if (claimId) params.append("metadata[claim_id]", claimId);
  params.append("metadata[plan]", plan);

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || "Stripe error" }, { status: 500 });
    }
    return NextResponse.json({ url: data.url });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
