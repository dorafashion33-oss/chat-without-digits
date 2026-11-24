import { supabase } from "@/integrations/supabase/client";
// src/lib/buzzConnect.ts
export interface BuzzDevice {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  isCurrent: boolean;
  pairedAt: string;
  lastActive: string;
  status: "active" | "revoked";
}

const STORAGE_KEY = "buzz:active-devices";
const DEVICE_ID_KEY = "buzz:current-device-id";

// Get or create persistent device ID for this browser
export const getCurrentDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = "dev_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

// Detect browser & OS
export const detectCurrentDeviceInfo = (): { name: string; type: "desktop" | "mobile" | "tablet"; browser: string; os: string } => {
  const ua = navigator.userAgent;
  let browser = "Chrome";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Brave")) browser = "Brave";

  let os = "Windows";
  if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  const isMobile = /Mobi|Android|iPhone/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  const type: "desktop" | "mobile" | "tablet" = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  return {
    name: `${browser} on ${os}`,
    type,
    browser,
    os,
  };
};

// Helper to normalize username key across sessions
export const normalizeUserStorageKey = (username?: string) =>
  `${STORAGE_KEY}:${(username || "user").replace(/^@/, "").toLowerCase().trim()}`;

// Clean logout: Chat tab par redirect hone se rokta hai aur seedha /auth bhejta hai
export const performFullLogout = async () => {
  try {
    localStorage.removeItem("buzz:current-device-id");
    localStorage.removeItem("buzz:remote-logout-signal");
    await supabase.auth.signOut();
  } catch (e) {
    console.error("SignOut error:", e);
  } finally {
    window.location.href = "/auth";
  }
};

// Fetch all linked devices for the current user
export const getLinkedDevices = (username?: string): BuzzDevice[] => {
  const currentId = getCurrentDeviceId();
  const info = detectCurrentDeviceInfo();
  const now = new Date().toISOString();

  let stored: BuzzDevice[] = [];
  try {
    const raw = localStorage.getItem(normalizeUserStorageKey(username));
    if (raw) stored = JSON.parse(raw);
  } catch {
    stored = [];
  }

  // Ensure current device is present
  const hasCurrent = stored.some((d) => d.id === currentId);
  if (!hasCurrent) {
    const currentDevice: BuzzDevice = {
      id: currentId,
      name: `${info.name} (This Device)`,
      type: info.type,
      browser: info.browser,
      os: info.os,
      isCurrent: true,
      pairedAt: now,
      lastActive: now,
      status: "active",
    };
    stored = [currentDevice, ...stored];
    saveDevices(stored, username);
  } else {
    // update lastActive
    stored = stored.map((d) => (d.id === currentId ? { ...d, isCurrent: true, lastActive: now } : { ...d, isCurrent: false }));
    saveDevices(stored, username);
  }

  return stored.filter((d) => d.status === "active");
};

export const saveDevices = (devices: BuzzDevice[], username?: string) => {
  try {
    localStorage.setItem(normalizeUserStorageKey(username), JSON.stringify(devices));
    window.dispatchEvent(new CustomEvent("buzz:devices-changed"));
  } catch (e) {
    console.error("Failed to save devices:", e);
  }
};

// Remote logout a single device (Across different devices & computers via Realtime)
export const revokeDevice = async (deviceId: string, username?: string) => {
  const current = getLinkedDevices(username);
  const updated = current.map((d) => (d.id === deviceId ? { ...d, status: "revoked" as const } : d));
  saveDevices(updated, username);

  localStorage.setItem("buzz:remote-logout-signal", JSON.stringify({ deviceId, time: Date.now() }));
  window.dispatchEvent(new CustomEvent("buzz:devices-changed"));

  const cleanUser = (username || "user").replace(/^@/, "").toLowerCase().trim();

  try {
    // 1. Direct device channel
    const devChannel = supabase.channel(`buzz-device-logout:${deviceId}`);
    await new Promise<void>((resolve) => {
      const t = setTimeout(() => resolve(), 2000);
      devChannel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(t);
          resolve();
        }
      });
    });

    // 2. User-wide security channel fallback
    const userChannel = supabase.channel(`buzz-user-security:${cleanUser}`);
    await new Promise<void>((resolve) => {
      const t = setTimeout(() => resolve(), 2000);
      userChannel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(t);
          resolve();
        }
      });
    });

    // Send 3 bursts so laptop catches it instantly
    for (let i = 0; i < 3; i++) {
      await devChannel.send({
        type: "broadcast",
        event: "device-revoked",
        payload: { deviceId, reason: "This device was remotely logged out from your phone." },
      });
      await userChannel.send({
        type: "broadcast",
        event: "device-revoked",
        payload: { deviceId, reason: "This device was remotely logged out from your phone." },
      });
      await new Promise((r) => setTimeout(r, 100));
    }

    supabase.removeChannel(devChannel);
    supabase.removeChannel(userChannel);
  } catch (err) {
    console.error("Realtime revoke failed:", err);
  }
};

// Remote logout all other devices
export const revokeAllOtherDevices = async (username?: string) => {
  const currentId = getCurrentDeviceId();
  const current = getLinkedDevices(username);
  const updated = current.map((d) => (d.id !== currentId ? { ...d, status: "revoked" as const } : d));
  saveDevices(updated, username);

  localStorage.setItem("buzz:remote-logout-signal", JSON.stringify({ deviceId: "ALL_OTHERS", except: currentId, time: Date.now() }));
  window.dispatchEvent(new CustomEvent("buzz:devices-changed"));

  const cleanUser = (username || "user").replace(/^@/, "").toLowerCase().trim();

  try {
    const channel = supabase.channel(`buzz-user-security:${cleanUser}`);
    await new Promise<void>((resolve) => {
      const t = setTimeout(() => resolve(), 2000);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(t);
          resolve();
        }
      });
    });

    for (let i = 0; i < 3; i++) {
      await channel.send({
        type: "broadcast",
        event: "logout-all-others",
        payload: { except: currentId, reason: "All other sessions were logged out remotely." },
      });
      await new Promise((r) => setTimeout(r, 100));
    }
    supabase.removeChannel(channel);
  } catch (err) {
    console.error("Realtime revoke all failed:", err);
  }
};

// Realtime Listener: Laptop/Computer screen par logout signal pakadte hi signOut karna
export const listenForRemoteLogout = (username: string | undefined, onLogout: (reason: string) => void) => {
  const myId = getCurrentDeviceId();
  const cleanUser = (username || "user").replace(/^@/, "").toLowerCase().trim();

  // 1. Same-device tab listener
  const checkSignal = (e: StorageEvent) => {
    if (e.key === "buzz:remote-logout-signal" && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        if (data.deviceId === "ALL_OTHERS" && data.except !== myId) {
          onLogout("This device was remotely logged out by your primary Buzz session.");
        } else if (data.deviceId === myId) {
          onLogout("This device was disconnected remotely from Buzz Settings.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };
  window.addEventListener("storage", checkSignal);

  // 2. Cross-device Realtime channel (Phone -> Laptop)
  const deviceChannel = supabase.channel(`buzz-device-logout:${myId}`);
  deviceChannel
    .on("broadcast", { event: "device-revoked" }, ({ payload }) => {
      onLogout(payload?.reason || "This device was remotely disconnected.");
    })
    .subscribe();

   const userChannel = supabase.channel(`buzz-user-security:${cleanUser}`);
  userChannel
    .on("broadcast", { event: "device-revoked" }, ({ payload }) => {
      // Sirf wahi specific secondary device logout hoga jiska ID match karta hai
      if (payload?.deviceId && payload.deviceId === myId) {
        onLogout(payload?.reason || "This device was remotely logged out.");
      }
    })
    .on("broadcast", { event: "logout-all-others" }, ({ payload }) => {
      if (payload?.except && payload.except !== myId) {
        onLogout(payload?.reason || "All secondary devices were logged out remotely.");
      }
    })
    .subscribe();

  return () => {
    window.removeEventListener("storage", checkSignal);
    supabase.removeChannel(deviceChannel);
    supabase.removeChannel(userChannel);
  };
};
