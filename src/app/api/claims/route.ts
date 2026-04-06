import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";
import { notify } from "@/lib/notify";

const CLAIMS_DIR = path.join(process.cwd(), "leads");
const CLAIMS_FILE = path.join(CLAIMS_DIR, "claims.json");

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

async function getClaims(): Promise<Claim[]> {
  try {
    const data = await readFile(CLAIMS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveClaims(claims: Claim[]) {
  await mkdir(CLAIMS_DIR, { recursive: true });
  await writeFile(CLAIMS_FILE, JSON.stringify(claims, null, 2));
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

  const claims = await getClaims();
  claims.push(claim);
  await saveClaims(claims);

  await notify({
    subject: `💰 New ${claim.plan.toUpperCase()} ${claim.type === "claim" ? "Claim" : "Listing"}: ${claim.businessName}`,
    kind: claim.type,
    data: claim as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ success: true, id: claim.id });
}

export async function GET() {
  const claims = await getClaims();
  return NextResponse.json({ claims, count: claims.length });
}
