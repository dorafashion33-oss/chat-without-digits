import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const CHAT_THEMES = [
  { id: "buzz", name: "Buzz Theme" },
  { id: "mint", name: "Mint" },
  { id: "rose", name: "Rose" },
  { id: "midnight", name: "Midnight" },
] as const;
export type ChatThemeId = typeof CHAT_THEMES[number]["id"];
export const chatThemeKey = (userId: string) => `buzz:chat-theme:${userId}`;
export function parseChatTheme(value: string | null): ChatThemeId {
  return CHAT_THEMES.find((theme) => theme.id === value)?.id ?? "buzz";
}
function readTheme(key: string): ChatThemeId {
  try { return parseChatTheme(localStorage.getItem(key)); } catch { return "buzz"; }
}
const ChatThemeContext = createContext<{ theme: ChatThemeId; selectTheme: (id: ChatThemeId) => boolean }>({ theme: "buzz", selectTheme: () => false });

export function ChatThemeProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const key = chatThemeKey(userId);
  const [theme, setTheme] = useState<ChatThemeId>(() => readTheme(key));
  useEffect(() => {
    setTheme(readTheme(key));
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) setTheme(readTheme(key));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);
  const selectTheme = (id: ChatThemeId) => {
    try { localStorage.setItem(key, id); setTheme(id); return true; } catch { return false; }
  };
  return <ChatThemeContext.Provider value={{ theme, selectTheme }}>{children}</ChatThemeContext.Provider>;
}
export const useChatTheme = () => useContext(ChatThemeContext);