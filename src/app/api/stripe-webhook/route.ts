import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { notify } from "@/lib/notify";
import { supabase } from "@/lib/supabase";

// Stripe webhook handler — verifies signature, processes events, updates claims, notifies you.
//
// Required env vars:
//   STRIPE_WEBHOOK_SECRET — whsec_... (from Stripe Dashboard → Developers → Webhooks → Signing secret)
//
// Events handled:
//   checkout.session.completed       → subscription started (mark claim active, notify)
//   customer.subscription.deleted    → cancellation (notify)
//   invoice.payment_failed           → failed payment (notify)
//   invoice.payment_succeeded        → recurring payment (silent, just logged)

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

async function markClaimActive(claimId: string | undefined, subscriptionId: string, plan: string) {
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
  if (error) console.error("Failed to mark claim active:", error);
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
        metadata?: { claim_id?: string; plan?: string };
      };
      const plan = session.metadata?.plan || "unknown";
      const claimId = session.metadata?.claim_id;
      const email = session.customer_email || session.customer_details?.email || "";
      const name = session.customer_details?.name || "";
      const amount = ((session.amount_total ?? 0) / 100).toFixed(2);

      await markClaimActive(claimId, session.subscription || "", plan);

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
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as { id: string; customer: string };
      await notify({
        subject: `❌ Subscription cancelled: ${sub.id}`,
        kind: "claim",
        data: {
          event: "subscription_cancelled",
          subscription_id: sub.id,
          customer_id: sub.customer,
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
