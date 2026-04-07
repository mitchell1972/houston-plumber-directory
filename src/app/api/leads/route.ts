import { NextRequest, NextResponse } from "next/server";
import { notify } from "@/lib/notify";
import { supabase } from "@/lib/supabase";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  zip: string;
  details: string;
  source: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const lead: Lead = {
    id: crypto.randomUUID(),
    name: body.name || "",
    phone: body.phone || "",
    email: body.email || "",
    service: body.service || "",
    zip: body.zip || "",
    details: body.details || "",
    source: body.source || "unknown",
    timestamp: new Date().toISOString(),
  };

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      service: lead.service,
      zip: lead.zip,
      details: lead.details,
      source: lead.source,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase leads insert failed:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
  if (data?.id) lead.id = data.id;

  await notify({
    subject: `🔔 New Plumbing Lead: ${lead.service} (${lead.zip})`,
    kind: "lead",
    data: lead as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ success: true, id: lead.id });
}

export async function GET() {
  if (!supabase) return NextResponse.json({ leads: [], count: 0 });
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data, count: data?.length ?? 0 });
}
