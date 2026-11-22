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

// Fetch all linked devices for the current user
export const getLinkedDevices = (username?: string): BuzzDevice[] => {
  const currentId = getCurrentDeviceId();
  const info = detectCurrentDeviceInfo();
  const now = new Date().toISOString();

  let stored: BuzzDevice[] = [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${username || "user"}`);
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
    localStorage.setItem(`${STORAGE_KEY}:${username || "user"}`, JSON.stringify(devices));
    window.dispatchEvent(new CustomEvent("buzz:devices-changed"));
  } catch (e) {
    console.error("Failed to save devices:", e);
  }
};

// Remote logout a single device
export const revokeDevice = (deviceId: string, username?: string) => {
  const current = getLinkedDevices(username);
  const updated = current.map((d) => (d.id === deviceId ? { ...d, status: "revoked" as const } : d));
  saveDevices(updated, username);

  // Broadcast remote logout alert
  localStorage.setItem("buzz:remote-logout-signal", JSON.stringify({ deviceId, time: Date.now() }));
  window.dispatchEvent(new CustomEvent("buzz:devices-changed"));
};

// Remote logout all other devices
export const revokeAllOtherDevices = (username?: string) => {
  const currentId = getCurrentDeviceId();
  const current = getLinkedDevices(username);
  const updated = current.map((d) => (d.id !== currentId ? { ...d, status: "revoked" as const } : d));
  saveDevices(updated, username);

  localStorage.setItem("buzz:remote-logout-signal", JSON.stringify({ deviceId: "ALL_OTHERS", except: currentId, time: Date.now() }));
  window.dispatchEvent(new CustomEvent("buzz:devices-changed"));
};
// Remote Logout Realtime Listener for Buzz Connect
export const listenForRemoteLogout = (onLogout: (reason: string) => void) => {
  const checkSignal = (e: StorageEvent) => {
    if (e.key === "buzz:remote-logout-signal" && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        const myId = getCurrentDeviceId();
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
  return () => window.removeEventListener("storage", checkSignal);
};
