// Buzz web-push worker (messaging only, no caching).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { d = { title: "Buzz", body: event.data?.text() }; }
  event.waitUntil(
    self.registration.showNotification(d.title || "Buzz", {
      body: d.body || "",
      tag: d.tag,
      renotify: true,
      requireInteraction: !!d.call,
      vibrate: d.call ? [400, 200, 400, 200, 400, 200, 400] : [120, 60, 120],
      icon: "/buzz-icon-192.png",
      badge: "/buzz-icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) { if ("focus" in c) return c.focus(); }
    return self.clients.openWindow("/");
  })());
});
