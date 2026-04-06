// GA4 conversion event helpers
// These fire custom events that show up in GA4 → Reports → Engagement → Events
// You can mark each one as a "Key Event" (conversion) in the GA4 Admin → Events screen.

type GtagFn = (command: string, eventName: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

function track(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  } else if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...params });
  }
}

export function trackCallPlumber(plumberName: string, plumberSlug: string, source = "plumber_page") {
  track("call_plumber", {
    plumber_name: plumberName,
    plumber_slug: plumberSlug,
    source,
    value: 1,
  });
}

export function trackVisitWebsite(plumberName: string, plumberSlug: string) {
  track("visit_plumber_website", {
    plumber_name: plumberName,
    plumber_slug: plumberSlug,
  });
}

export function trackQuoteSubmit(source: string, service: string) {
  track("generate_lead", {
    source,
    service,
    value: 1,
    currency: "USD",
  });
}

export function trackQuoteStart(source: string) {
  track("begin_quote", { source });
}
