import { Search, MessageSquarePlus, Pin, Menu, Settings, User, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import buzzLogo from "@/assets/buzz-logo.jpeg";

import type { Chat } from "@/data/mockData";
import type { NavSection } from "./NavIconBar";

type StreamFilter = "all" | "personal" | "groups" | "unread";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  username?: string;
  onNavigate?: (section: NavSection) => void;
}

const ChatSidebar = ({ chats, activeChatId, onSelectChat, username, onNavigate }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<StreamFilter>("all");
  const { theme, setTheme } = useTheme();

  const filtered = chats.filter((c) => {
    const matchesSearch =
      c.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "unread") return c.unreadCount > 0;
    return true;
  });

  const pinned = filtered.filter((c) => c.isPinned);
  const unpinned = filtered.filter((c) => !c.isPinned);

  const filters: { id: StreamFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "personal", label: "Personal" },
    { id: "groups", label: "Groups" },
    { id: "unread", label: "Unread" },
  ];

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Hamburger - mobile only */}
          <Drawer>
            <DrawerTrigger asChild>
              <button className="rounded-lg p-1.5 transition-colors hover:bg-accent lg:hidden">
                <Menu className="h-5 w-5 text-foreground" />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6 space-y-2">
                {/* User info */}
                <div className="flex items-center gap-3 rounded-xl p-4 mb-3" style={{ background: "linear-gradient(135deg, hsl(var(--brand-purple) / 0.1), hsl(var(--brand-magenta) / 0.1))" }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-brand text-sm font-bold text-white">
                    {username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">@{username || "user"}</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
                {/* Theme toggle */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-purple-500" />}
                  <span className="text-sm font-medium text-foreground">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>
                {/* Settings */}
                <button
                  onClick={() => onNavigate?.("settings")}
                  className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
                >
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Settings</span>
                </button>
                {/* Profile */}
                <button
                  onClick={() => onNavigate?.("profile")}
                  className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
                >
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Profile</span>
                </button>
              </div>
            </DrawerContent>
          </Drawer>
          <h1 className="text-xl font-bold gradient-brand-text">Streams</h1>
        </div>
        <button className="rounded-full p-2 transition-colors hover:bg-accent">
          <MessageSquarePlus className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search streams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Smart Filters */}
      <div className="flex gap-1.5 px-3 pb-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.id
                ? "gradient-brand text-white"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {pinned.length > 0 && (
          <div className="px-4 pb-1 pt-3">
            <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          </div>
        )}
        {pinned.map((chat) => (
          <ChatItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} onSelect={onSelectChat} />
        ))}
        {unpinned.length > 0 && pinned.length > 0 && (
          <div className="px-4 pb-1 pt-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">All Messages</span>
          </div>
        )}
        {unpinned.map((chat) => (
          <ChatItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} onSelect={onSelectChat} />
        ))}
      </div>
    </div>
  );
};

const ChatItem = ({
  chat,
  isActive,
  onSelect,
}: {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string) => void;
}) => {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500",
    "bg-indigo-500", "bg-fuchsia-500", "bg-cyan-500", "bg-blue-600",
  ];
  const colorIndex = chat.user.id.charCodeAt(0) % colors.length;

  return (
    <button
      onClick={() => onSelect(chat.id)}
      className={`flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60 ${
        isActive ? "bg-accent" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors[colorIndex]} text-sm font-semibold text-white`}>
          {chat.user.avatar}
        </div>
        {chat.user.isOnline && (
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-chat-sidebar bg-online" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col text-left">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-semibold text-foreground">{chat.user.displayName}</span>
          <span className={`text-xs ${chat.unreadCount > 0 ? "font-semibold text-primary" : "text-muted-foreground"}`}>
            {chat.lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-xs text-muted-foreground">{chat.lastMessage}</p>
          {chat.unreadCount > 0 && (
            <span className="ml-2 flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full gradient-brand px-1.5 text-[10px] font-bold text-white animate-pulse">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatSidebar;
