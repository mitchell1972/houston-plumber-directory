/* eslint-disable no-console */
// Reads leads/houston-plumbers-outreach.csv, fetches each website + /contact,
// extracts emails, writes leads/houston-plumbers-with-emails.csv

import { readFile, writeFile } from "fs/promises";
import path from "path";

const CSV_IN = path.join(process.cwd(), "leads", "houston-plumbers-outreach.csv");
const CSV_OUT = path.join(process.cwd(), "leads", "houston-plumbers-with-emails.csv");

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const BAD_DOMAINS = ["sentry.io", "wixpress.com", "example.com", "godaddy.com", "schema.org", "w3.org", "png", "jpg", "svg", "webp"];
const BAD_LOCAL = ["noreply", "no-reply", "donotreply", "wordpress", "your-email", "name@", "user@"];

function isGoodEmail(e: string): boolean {
  const lower = e.toLowerCase();
  if (BAD_DOMAINS.some((d) => lower.includes(d))) return false;
  if (BAD_LOCAL.some((l) => lower.startsWith(l))) return false;
  if (lower.length > 60) return false;
  if (/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/.test(lower)) return false;
  return true;
}

async function fetchWithTimeout(url: string, ms = 8000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
      redirect: "follow",
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractEmails(html: string): string[] {
  const found = new Set<string>();
  const matches = html.match(EMAIL_RE) || [];
  for (const m of matches) {
    if (isGoodEmail(m)) found.add(m.toLowerCase());
  }
  return Array.from(found);
}

async function findEmail(website: string): Promise<string> {
  try {
    const u = new URL(website);
    const base = `${u.protocol}//${u.host}`;
    const candidates = [website, `${base}/contact`, `${base}/contact-us`, `${base}/about`];
    for (const url of candidates) {
      const html = await fetchWithTimeout(url);
      if (!html) continue;
      const emails = extractEmails(html);
      if (emails.length > 0) {
        // Prefer non-info@ if multiple
        const specific = emails.find((e) => !e.startsWith("info@") && !e.startsWith("contact@"));
        return specific || emails[0];
      }
    }
  } catch {}
  return "";
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQ = !inQ;
      else if (c === "," && !inQ) {
        cells.push(cur);
        cur = "";
      } else cur += c;
    }
    cells.push(cur);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] || ""));
    return row;
  });
}

function toCsv(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h])).join(","));
  return lines.join("\n");
}

async function main() {
  const text = await readFile(CSV_IN, "utf8");
  const rows = parseCsv(text);
  console.log(`Loaded ${rows.length} rows`);

  const CONCURRENCY = 8;
  let done = 0;
  let withEmail = 0;
  const out: Record<string, string>[] = [];

  async function worker(row: Record<string, string>) {
    const email = row.website ? await findEmail(row.website) : "";
    if (email) withEmail++;
    out.push({ ...row, email });
    done++;
    if (done % 10 === 0) console.log(`  ${done}/${rows.length}  (${withEmail} emails found)`);
  }

  // Simple concurrency pool
  const queue = [...rows];
  const workers: Promise<void>[] = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(
      (async () => {
        while (queue.length) {
          const r = queue.shift();
          if (r) await worker(r);
        }
      })()
    );
  }
  await Promise.all(workers);

  // Preserve original ordering by place_id
  const order = new Map(rows.map((r, i) => [r.place_id, i]));
  out.sort((a, b) => (order.get(a.place_id) ?? 0) - (order.get(b.place_id) ?? 0));

  await writeFile(CSV_OUT, toCsv(out), "utf8");
  console.log(`\n✅ ${withEmail}/${rows.length} emails found`);
  console.log(`Saved to ${CSV_OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
