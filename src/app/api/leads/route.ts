import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

const LEADS_DIR = path.join(process.cwd(), "leads");
const LEADS_FILE = path.join(LEADS_DIR, "leads.json");

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

async function getLeads(): Promise<Lead[]> {
  try {
    const data = await readFile(LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveLeads(leads: Lead[]) {
  await mkdir(LEADS_DIR, { recursive: true });
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
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

  const leads = await getLeads();
  leads.push(lead);
  await saveLeads(leads);

  // In production, you would:
  // 1. Send email notification to you
  // 2. Send SMS to matched plumbers
  // 3. Store in a real database (Supabase, etc.)
  console.log("New lead received:", lead);

  return NextResponse.json({ success: true, id: lead.id });
}

export async function GET() {
  const leads = await getLeads();
  return NextResponse.json({ leads, count: leads.length });
}
