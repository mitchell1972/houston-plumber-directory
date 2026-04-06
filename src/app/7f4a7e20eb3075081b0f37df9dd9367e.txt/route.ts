import { NextResponse } from "next/server";

const INDEXNOW_KEY = "7f4a7e20eb3075081b0f37df9dd9367e";

export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
