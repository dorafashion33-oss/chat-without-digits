// Single guarded service-worker registration wrapper for Buzz offline mode.
const SW_URL = "/sw.js";

function isBlockedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  if (window.self !== window.top) return true;

  const host = window.location.hostname;
  const blockedHost =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  if (blockedHost) return true;

  return new URLSearchParams(window.location.search).get("sw") === "off";
}

async function unregisterAppSW() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => (r.active?.scriptURL || r.waiting?.scriptURL || "").endsWith(SW_URL))
      .map((r) => r.unregister())
  );
}

export function registerBuzzServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (isBlockedContext()) {
    void unregisterAppSW();
    return;
  }
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(SW_URL).catch(() => {});
  });
}
