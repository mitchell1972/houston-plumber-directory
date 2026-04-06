// Notification helper: sends email via Resend + appends to Google Sheets webhook.
// Both are optional — set the env vars to activate them. Without env vars, this is a no-op.
//
// Required env vars:
//   RESEND_API_KEY        — get from https://resend.com (free 3,000 emails/mo)
//   NOTIFY_EMAIL          — your email to receive notifications
//   NOTIFY_FROM_EMAIL     — verified sender (e.g. notifications@houstonplumberdirectory.com)
//   GOOGLE_SHEETS_WEBHOOK — Apps Script webhook URL (see scripts/google-sheets-setup.md)

type NotifyPayload = {
  subject: string;
  kind: "lead" | "claim" | "new_listing";
  data: Record<string, unknown>;
};

export async function notify({ subject, kind, data }: NotifyPayload) {
  // Fire both in parallel; never throw — notifications must not break submissions
  await Promise.allSettled([sendEmail(subject, kind, data), appendToSheet(kind, data)]);
}

async function sendEmail(subject: string, kind: string, data: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.NOTIFY_FROM_EMAIL || "notifications@houstonplumberdirectory.com";
  if (!apiKey || !to) return;

  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:4px 8px;font-weight:bold">${k}</td><td style="padding:4px 8px">${escapeHtml(String(v ?? ""))}</td></tr>`)
    .join("");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px">
      <h2 style="color:#1e3a8a">New ${kind} on Houston Plumber Directory</h2>
      <table style="border-collapse:collapse;width:100%;border:1px solid #e5e7eb">${rows}</table>
      <p style="color:#6b7280;font-size:12px;margin-top:16px">Sent automatically from houstonplumberdirectory.com</p>
    </div>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
  } catch (err) {
    console.error("Resend email failed:", err);
  }
}

async function appendToSheet(kind: string, data: Record<string, unknown>) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, timestamp: new Date().toISOString(), ...data }),
    });
  } catch (err) {
    console.error("Google Sheets webhook failed:", err);
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
