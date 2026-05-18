// Lightweight analytics event tracker for Buzz.
// Events are namespaced and persisted to localStorage so drop-off and
// performance can be inspected without an external pipeline.

export type AnalyticsPayload = Record<string, unknown>;

const STORAGE_KEY = "buzz-analytics-log";
const MAX_EVENTS = 500;

export function trackEvent(name: string, payload: AnalyticsPayload = {}) {
  const event = {
    name,
    payload,
    ts: Date.now(),
    sessionId: getSessionId(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const log: typeof event[] = raw ? JSON.parse(raw) : [];
    log.push(event);
    if (log.length > MAX_EVENTS) log.splice(0, log.length - MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    /* ignore quota errors */
  }

  // Console for live debugging / future GA / PostHog adapter.
  // eslint-disable-next-line no-console
  console.info("[analytics]", name, payload);

  // Forward to gtag if present (no-op otherwise)
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.("event", name, payload);
}

function getSessionId(): string {
  const key = "buzz-session-id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function getAnalyticsLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
