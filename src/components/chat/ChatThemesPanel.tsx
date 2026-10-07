import { ArrowLeft, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CHAT_THEMES, useChatTheme } from "./ChatThemeProvider";
import wallpaper from "@/assets/buzz-chat-wallpaper.jpg";
import type { CSSProperties } from "react";

export const chatWallpaperStyle = { "--buzz-wallpaper": `url("${wallpaper}")` } as CSSProperties;

export default function ChatThemesPanel({ onBack }: { onBack: () => void }) {
  const { theme, selectTheme } = useChatTheme();
  return (
    <div className="flex h-full min-h-0 flex-col bg-chat-sidebar pb-20 lg:pb-0" data-motion-fx="off">
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-chat-header px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to settings"><ArrowLeft /></Button>
        <h1 className="text-lg font-semibold text-foreground">Chat Themes</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Chat theme choices">
          {CHAT_THEMES.map((item) => (
            <Button key={item.id} variant="outline" aria-pressed={theme === item.id} aria-label={item.name}
              onClick={() => { if (selectTheme(item.id)) toast.success(`${item.name} selected`); else toast.error("Theme could not be saved. Please allow browser storage and try again."); }}
              className={`h-auto min-w-0 flex-col items-stretch gap-0 overflow-hidden whitespace-normal p-0 ${theme === item.id ? "border-primary ring-1 ring-primary" : "border-border"}`}>
              <div data-chat-theme={item.id} style={chatWallpaperStyle} className="chat-theme-surface w-full">
                <div className="chat-wallpaper relative flex h-44 flex-col justify-center gap-3 p-3">
                  <div className="relative self-start rounded-lg rounded-bl-sm bg-chat-bubble-other px-3 py-2 text-left text-xs text-chat-bubble-other-foreground">Hey, Buzz! 🐝</div>
                  <div className="relative self-end rounded-lg rounded-br-sm bg-chat-bubble-own px-3 py-2 text-left text-xs text-chat-bubble-own-foreground">Let's talk <CheckCheck className="ml-1 inline h-3 w-3" /></div>
                </div>
              </div>
              <span className="flex min-h-14 items-center justify-between gap-1 px-3 py-2 text-left text-sm text-foreground">
                <span>{item.name}{item.id === "buzz" && <span className="block text-xs font-normal text-muted-foreground">Default</span>}</span>
                {theme === item.id && <Check className="shrink-0 text-primary" />}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}