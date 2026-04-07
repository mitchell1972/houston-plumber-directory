/* eslint-disable no-console */
// Builds a Gmail mail-merge-ready CSV from houston-plumbers-with-emails.csv
// Output columns: email, first_name, business_name, city, claim_url
// Only rows with a valid email are included.

import { readFile, writeFile } from "fs/promises";
import path from "path";

const IN = path.join(process.cwd(), "leads", "houston-plumbers-with-emails.csv");
const OUT = path.join(process.cwd(), "leads", "houston-plumbers-mailmerge.csv");

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  const parseLine = (line: string) => {
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = !inQ;
      } else if (c === "," && !inQ) {
        cells.push(cur);
        cur = "";
      } else cur += c;
    }
    cells.push(cur);
    return cells;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] || ""));
    return row;
  });
}

function extractCity(address: string): string {
  // "1704 Avenue D, Katy, TX 77493, USA" -> "Katy"
  const parts = address.split(",").map((s) => s.trim());
  return parts[1] || "Houston";
}

function cleanBusinessName(name: string): string {
  return name.replace(/\s+(LLC|Inc\.?|L\.L\.C\.?)$/i, "").trim();
}

function esc(v: string): string {
  return `"${(v || "").replace(/"/g, '""')}"`;
}

async function main() {
  const text = await readFile(IN, "utf8");
  const rows = parseCsv(text);
  const withEmail = rows.filter((r) => r.email && r.email.includes("@"));
  console.log(`${withEmail.length}/${rows.length} rows have emails`);

  const headers = ["email", "first_name", "business_name", "city", "claim_url"];
  const out = [headers.join(",")];
  for (const r of withEmail) {
    const business = cleanBusinessName(r.name);
    out.push(
      [
        esc(r.email),
        esc("there"), // safe default — we don't have first names
        esc(business),
        esc(extractCity(r.address)),
        esc(r.outreach_url),
      ].join(",")
    );
  }

  await writeFile(OUT, out.join("\n"), "utf8");
  console.log(`✅ Wrote ${withEmail.length} rows to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
