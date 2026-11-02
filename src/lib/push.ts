import { supabase } from "@/integrations/supabase/client";

// Public VAPID key (safe to ship in client).
const VAPID_PUBLIC_KEY = "BM0aVsEeicrYtVz6iVmdPJQbzy325RVhP18N-W9_EK9kyNngl5Y9RAG9ur5ZI2EW3w4Gd4BUqrm3-lZizUIs5cY";

function urlB64ToUint8Array(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export const pushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/** Ask permission and save this device's push subscription. */
export async function enablePush(userId: string): Promise<boolean> {
  if (!pushSupported()) return false;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return false;
  const reg = await navigator.serviceWorker.register("/push-sw.js", { scope: "/push/" });
  await navigator.serviceWorker.ready.catch(() => {});
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY) });
  }
  const j = sub.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert(
    { user_id: userId, endpoint: sub.endpoint, p256dh: j.keys!.p256dh, auth: j.keys!.auth },
    { onConflict: "endpoint" }
  );
  return !error;
}

/** Silently refresh subscription if permission already granted. */
export function syncPush(userId: string) {
  if (pushSupported() && Notification.permission === "granted") void enablePush(userId).catch(() => {});
}

/** Fire-and-forget push to another user. */
export function notifyPush(to: string, kind: "message" | "call", extra: { text?: string; callType?: "voice" | "video" } = {}) {
  void supabase.functions.invoke("send-push", { body: { to, kind, ...extra } }).catch(() => {});
}
