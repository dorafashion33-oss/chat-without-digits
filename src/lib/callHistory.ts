export interface CallLog {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  callType: "voice" | "video";
  direction: "incoming" | "outgoing" | "missed";
  duration: number; // in seconds
  timestamp: string;
}

const STORAGE_KEY = "buzz:call-history";

export const getCallHistory = (): CallLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const recordCallLog = (log: Omit<CallLog, "id" | "timestamp">) => {
  try {
    const existing = getCallHistory();
    const newEntry: CallLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...existing].slice(0, 50); // Keep last 50 calls
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("buzz:call-history-updated"));
  } catch (err) {
    console.warn("Failed to record call log:", err);
  }
};

export const clearCallHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("buzz:call-history-updated"));
};
