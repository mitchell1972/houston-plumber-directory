export async function GET() {
  return new Response(
    "google-site-verification: googlec1eaf7440932cc4a.html",
    {
      headers: { "Content-Type": "text/html" },
    }
  );
}
