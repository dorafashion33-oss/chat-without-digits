import { Search, MessageSquarePlus, Pin, Menu, Settings, User, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import NewChatDialog from "./NewChatDialog";
import type { ChatThread, DbProfile } from "@/hooks/useRealtimeMessages";
import type { NavSection } from "./NavIconBar";

type StreamFilter = "all" | "personal" | "unread";

interface ChatSidebarProps {
  threads: ChatThread[];
  profiles: DbProfile[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onStartChat: (userId: string) => void;
  username?: string;
  onNavigate?: (section: NavSection) => void;
}

const ChatSidebar = ({ threads, profiles, activeChatId, onSelectChat, onStartChat, username, onNavigate }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<StreamFilter>("all");
  const [showNewChat, setShowNewChat] = useState(false);
  const { theme, setTheme } = useTheme();

  const filtered = threads.filter((t) => {
    const name = t.profile.display_name || t.profile.username;
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.profile.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "unread") return t.unreadCount > 0;
    return true;
  });

  const filters: { id: StreamFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "personal", label: "Personal" },
    { id: "unread", label: "Unread" },
  ];

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-3 rounded-xl p-4 mb-3" style={{ background: "linear-gradient(135deg, hsl(var(--brand-purple) / 0.1), hsl(var(--brand-magenta) / 0.1))" }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-brand text-sm font-bold text-white">
                    {username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">@{username || "user"}</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent">
                  {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-purple-500" />}
                  <span className="text-sm font-medium text-foreground">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>
                <button onClick={() => onNavigate?.("settings")} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Settings</span>
                </button>
                <button onClick={() => onNavigate?.("profile")} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Profile</span>
                </button>
              </div>
            </DrawerContent>
          </Drawer>
          <h1 className="text-xl font-bold gradient-brand-text">Streams</h1>
        </div>
        <button onClick={() => setShowNewChat(true)} className="rounded-full p-2 transition-colors hover:bg-accent">
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
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <MessageSquarePlus className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground text-center">No conversations yet</p>
            <button
              onClick={() => setShowNewChat(true)}
              className="mt-3 rounded-full gradient-brand px-4 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            >
              Start a chat
            </button>
          </div>
        ) : (
          filtered.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              isActive={thread.id === activeChatId}
              onSelect={onSelectChat}
            />
          ))
        )}
      </div>

      {showNewChat && (
        <NewChatDialog
          profiles={profiles}
          onSelect={(userId) => {
            setShowNewChat(false);
            onStartChat(userId);
          }}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </div>
  );
};

const ThreadItem = ({
  thread,
  isActive,
  onSelect,
}: {
  thread: ChatThread;
  isActive: boolean;
  onSelect: (id: string) => void;
}) => {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500",
    "bg-indigo-500", "bg-fuchsia-500", "bg-cyan-500", "bg-blue-600",
  ];
  const colorIndex = thread.profile.username.charCodeAt(0) % colors.length;
  const displayName = thread.profile.display_name || thread.profile.username;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      onClick={() => onSelect(thread.id)}
      className={`flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60 ${
        isActive ? "bg-accent" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors[colorIndex]} text-sm font-semibold text-white`}>
          {initials}
        </div>
        {thread.profile.is_online && (
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-chat-sidebar bg-online" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col text-left">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-semibold text-foreground">{displayName}</span>
          <span className={`text-xs ${thread.unreadCount > 0 ? "font-semibold text-primary" : "text-muted-foreground"}`}>
            {thread.lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-xs text-muted-foreground">{thread.lastMessage}</p>
          {thread.unreadCount > 0 && (
            <span className="ml-2 flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full gradient-brand px-1.5 text-[10px] font-bold text-white animate-pulse">
              {thread.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatSidebar;
