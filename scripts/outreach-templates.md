# Cold Outreach Templates

Use these with the CSV from `scripts/scrape-houston-plumbers.ts`.

---

## Template 1: Free claim (warm-up email)

**Subject:** {{name}} is already listed on Houston Plumber Directory

Hi there,

Quick heads up — your business **{{name}}** is already showing up on houstonplumberdirectory.com when Houston homeowners search for plumbers in your area.

I built this directory to be a cleaner, cheaper alternative to Yelp and HomeAdvisor for local plumbers. Right now your listing is **free**, but it's missing photos, your business description, and a website link.

You can claim it (still free, takes 60 seconds) here:
👉 {{outreach_url}}

After claiming, you can also upgrade to a Featured listing ($29/mo) which puts you above all free listings — most of our plumbers see one extra job in the first month, which more than pays for the year.

Cheers,
Mitchell
houstonplumberdirectory.com

P.S. If you'd rather not be listed at all, just reply and I'll remove you.

---

## Template 2: Direct upsell (after they claim)

**Subject:** Your Houston Plumber Directory listing is live — want to be #1?

Hey {{first_name}},

Thanks for claiming **{{name}}**! Your free listing is now live.

I noticed you're currently below the Featured plumbers in {{primary_area}}. Featured listings get **5x more clicks** because they appear at the top with photos and a "Featured" badge.

Featured is $29/month — cancel any time, and we offer a 30-day money-back guarantee. One plumbing job pays for an entire year.

👉 Upgrade here: https://houstonplumberdirectory.com/list-your-business

Reply with any questions.

Mitchell

---

## Template 3: SMS / postcard (140 chars)

> Your Houston plumbing biz is already on houstonplumberdirectory.com. Claim it free + get more leads: {{outreach_url}} - Mitchell

---

## Template 4: Yelp/HomeAdvisor switcher (highest converting)

**Subject:** Stop paying $80/lead to HomeAdvisor

Hi {{first_name}},

Most Houston plumbers I talk to are paying HomeAdvisor or Angi $15–$80 per lead — and half of those leads are tire-kickers or already shared with 5 competitors.

I run **houstonplumberdirectory.com** — a Houston-only directory where you pay $29/month flat (no per-lead fees), customers call you directly (no shared leads), and you cancel any time.

Your listing is already there:
👉 {{outreach_url}}

Worth a look?

Mitchell

---

## Sending tips

- **Tools:** Instantly.ai, Smartlead, Apollo, or Gmail mail merge (GMass)
- **Volume:** Start with 50/day from a warm domain. Don't spam.
- **Subject lines:** Lowercase, no emojis, sound human
- **From name:** Your real name, not "Houston Plumber Directory"
- **Personalize line 1:** Mention something specific from their Google reviews
- **Reply tracking:** Use a CRM (HubSpot free tier or Notion) to track who replied

## Finding emails

The Google Places API doesn't return email addresses. Options:

1. **Visit each website** and check the contact page (slow but free)
2. **Hunter.io** — $34/mo for 500 lookups (fastest)
3. **Apollo.io** — free tier gives 60 credits/month
4. **Snov.io** — $39/mo, includes verification

Run the scraper, get the CSV, then enrich the rows that have a website URL.
