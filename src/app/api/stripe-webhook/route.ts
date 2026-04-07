import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { notify } from "@/lib/notify";
import { supabase } from "@/lib/supabase";

// Stripe webhook handler — verifies signature, processes events, updates claims
// AND the plumbers table so paid upgrades actually appear on the live site.
//
// Required env vars:
//   STRIPE_WEBHOOK_SECRET — whsec_... (from Stripe Dashboard → Developers → Webhooks → Signing secret)
//
// Events handled:
//   checkout.session.completed       → subscription started (mark claim active, flip plumber flags, notify)
//   customer.subscription.deleted    → cancellation (unflag plumber, notify)
//   invoice.payment_failed           → failed payment (notify)
//   invoice.payment_succeeded        → recurring payment (silent, just logged)
//
// Architecture note: plumber_slug is threaded through Stripe metadata (session + subscription)
// by the checkout endpoint, so this webhook never needs to SELECT from the claims table —
// which matters because the anon role only has INSERT/UPDATE policies on claims, not SELECT.

export const runtime = "nodejs"; // crypto requires Node runtime, not Edge

type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

function verifyStripeSignature(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  // Reject events older than 5 minutes (replay protection)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (Number.isNaN(age) || age > 300) return false;

  const signed = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signed).digest("hex");

  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Fire-and-forget update of the claims row. We don't read anything back
// because the anon role has no SELECT policy on claims.
async function markClaimActive(
  claimId: string | undefined,
  subscriptionId: string,
  plan: string
): Promise<void> {
  if (!claimId || !supabase) return;
  const { error } = await supabase
    .from("claims")
    .update({
      status: "active",
      stripe_subscription_id: subscriptionId,
      activated_plan: plan,
      activated_at: new Date().toISOString(),
    })
    .eq("id", claimId);
  if (error) {
    console.error("Failed to mark claim active:", error);
  }
}

// Flip is_featured / is_premium on the plumbers row that matches this slug.
// Also updates the `plan` field so we can report tier stats later.
async function upgradePlumber(slug: string | undefined, plan: string) {
  if (!slug || !supabase) return;
  const patch: Record<string, unknown> = {
    plan: plan === "premium" ? "premium" : "featured",
    is_featured: plan === "featured" || plan === "premium",
    is_premium: plan === "premium",
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("plumbers").update(patch).eq("slug", slug);
  if (error) {
    console.error(`Failed to upgrade plumber ${slug}:`, error);
    return;
  }
  // Bust the Next.js page cache so the badge shows up immediately.
  try {
    revalidatePath("/");
    revalidatePath(`/plumber/${slug}`);
  } catch (e) {
    console.warn("revalidatePath failed (non-fatal):", e);
  }
}

// Reverse of upgradePlumber — used when a subscription is cancelled.
// plumber_slug comes from subscription.metadata (threaded through at checkout time)
// so we don't need to SELECT from claims.
async function downgradePlumber(slug: string | undefined) {
  if (!slug || !supabase) return;
  const { error } = await supabase
    .from("plumbers")
    .update({
      plan: "free",
      is_featured: false,
      is_premium: false,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);
  if (error) {
    console.error(`Failed to downgrade plumber ${slug}:`, error);
    return;
  }
  try {
    revalidatePath("/");
    revalidatePath(`/plumber/${slug}`);
  } catch (e) {
    console.warn("revalidatePath failed (non-fatal):", e);
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!verifyStripeSignature(payload, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log(`[stripe-webhook] ${event.type} ${event.id}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as {
        id: string;
        customer_email?: string;
        customer_details?: { email?: string; name?: string };
        amount_total?: number;
        currency?: string;
        subscription?: string;
        metadata?: { claim_id?: string; plan?: string; plumber_slug?: string };
      };
      const plan = session.metadata?.plan || "unknown";
      const claimId = session.metadata?.claim_id;
      const plumberSlug = session.metadata?.plumber_slug;
      const email = session.customer_email || session.customer_details?.email || "";
      const name = session.customer_details?.name || "";
      const amount = ((session.amount_total ?? 0) / 100).toFixed(2);

      // Run claim update and plumber upgrade in parallel — neither depends on the other.
      await Promise.all([
        markClaimActive(claimId, session.subscription || "", plan),
        upgradePlumber(plumberSlug, plan),
      ]);

      await notify({
        subject: `💰 NEW SUBSCRIPTION: ${plan.toUpperCase()} - $${amount}/mo (${name || email})`,
        kind: "claim",
        data: {
          event: "subscription_started",
          plan,
          amount: `$${amount}`,
          email,
          name,
          subscription_id: session.subscription || "",
          session_id: session.id,
          claim_id: claimId || "",
          plumber_slug: plumberSlug || "",
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as {
        id: string;
        customer: string;
        metadata?: { plumber_slug?: string; plan?: string };
      };
      const plumberSlug = sub.metadata?.plumber_slug;
      await downgradePlumber(plumberSlug);
      await notify({
        subject: `❌ Subscription cancelled: ${sub.id}`,
        kind: "claim",
        data: {
          event: "subscription_cancelled",
          subscription_id: sub.id,
          customer_id: sub.customer,
          plumber_slug: plumberSlug || "",
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const inv = event.data.object as {
        id: string;
        customer_email?: string;
        amount_due?: number;
        attempt_count?: number;
      };
      const amount = ((inv.amount_due ?? 0) / 100).toFixed(2);
      await notify({
        subject: `⚠️ Payment FAILED: $${amount} (attempt ${inv.attempt_count ?? 1})`,
        kind: "claim",
        data: {
          event: "payment_failed",
          invoice_id: inv.id,
          email: inv.customer_email || "",
          amount: `$${amount}`,
          attempt: inv.attempt_count ?? 1,
        },
      });
      break;
    }

    case "invoice.payment_succeeded":
      // Recurring success — silent log only (don't spam your inbox monthly)
      break;

    default:
      console.log(`[stripe-webhook] unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
