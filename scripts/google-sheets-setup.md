# Google Sheets Webhook Setup (5 minutes)

This sends every new lead and claim to a Google Sheet automatically.

## Step 1 — Create the sheet

1. Go to https://sheets.new
2. Name it **"Houston Plumber Directory - Submissions"**
3. In row 1, add these column headers (in order):

```
Timestamp | Kind | Name | Business | Email | Phone | Plan | Service | ZIP | Source | Plumber Slug | Message | Details
```

## Step 2 — Add the Apps Script

1. In your sheet, click **Extensions → Apps Script**
2. Delete the placeholder code and paste this:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.kind || "",
    data.name || data.ownerName || "",
    data.businessName || "",
    data.email || "",
    data.phone || "",
    data.plan || "",
    data.service || "",
    data.zip || "",
    data.source || "",
    data.plumberSlug || "",
    data.message || "",
    data.details || "",
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Deploy → New deployment**
4. Click the gear icon → choose **Web app**
5. Settings:
   - **Description:** "Houston Plumber webhook"
   - **Execute as:** Me
   - **Who has access:** **Anyone** (required for the webhook to work)
6. Click **Deploy**, then **Authorize access**, allow the permissions
7. **Copy the Web app URL** — looks like `https://script.google.com/macros/s/AKfycbz.../exec`

## Step 3 — Add to Vercel

1. Go to your Vercel project → Settings → Environment Variables
2. Add:
   - **Key:** `GOOGLE_SHEETS_WEBHOOK`
   - **Value:** (paste the URL from step 2.7)
   - **Environments:** Production, Preview, Development
3. Click **Save**, then redeploy (any new deploy picks it up)

## Test it

Submit a test claim or quote on your live site, then check the sheet — a new row should appear within ~3 seconds.

## Troubleshooting

- **Nothing appears:** Re-deploy the Apps Script as a "New version" (not just save)
- **403 errors in Vercel logs:** Make sure the script is set to "Anyone" access
- **Wrong columns:** The script uses the first sheet — make sure your headers are on Sheet1
