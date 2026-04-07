import { NextRequest, NextResponse } from "next/server";
import { notify } from "@/lib/notify";
import { supabase } from "@/lib/supabase";

interface Claim {
  id: string;
  type: "claim" | "new_listing";
  plumberSlug?: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  website?: string;
  plan: "free" | "featured" | "premium";
  message?: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const claim: Claim = {
    id: crypto.randomUUID(),
    type: body.type === "new_listing" ? "new_listing" : "claim",
    plumberSlug: body.plumberSlug || undefined,
    businessName: body.businessName || "",
    ownerName: body.ownerName || "",
    email: body.email || "",
    phone: body.phone || "",
    website: body.website || undefined,
    plan: ["free", "featured", "premium"].includes(body.plan) ? body.plan : "free",
    message: body.message || undefined,
    timestamp: new Date().toISOString(),
  };

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("claims")
    .insert({
      type: claim.type,
      plumber_slug: claim.plumberSlug,
      business_name: claim.businessName,
      owner_name: claim.ownerName,
      email: claim.email,
      phone: claim.phone,
      website: claim.website,
      plan: claim.plan,
      message: claim.message,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase claims insert failed:", error);
    return NextResponse.json({ error: "Failed to save claim" }, { status: 500 });
  }
  if (data?.id) claim.id = data.id;

  await notify({
    subject: `💰 New ${claim.plan.toUpperCase()} ${claim.type === "claim" ? "Claim" : "Listing"}: ${claim.businessName}`,
    kind: claim.type,
    data: claim as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ success: true, id: claim.id });
}

export async function GET() {
  if (!supabase) return NextResponse.json({ claims: [], count: 0 });
  const { data, error } = await supabase
    .from("claims")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ claims: data, count: data?.length ?? 0 });
}
