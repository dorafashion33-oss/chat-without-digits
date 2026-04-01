import { Search, MessageSquarePlus, Menu, Settings, User, Moon, Sun, Users, LogOut } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import NewChatDialog from "./NewChatDialog";
import type { ChatThread, DbProfile } from "@/hooks/useRealtimeMessages";
import type { NavSection } from "./NavIconBar";
import buzzLogo from "@/assets/buzz-logo.jpeg";

type StreamFilter = "all" | "unread";

interface ChatSidebarProps {
  threads: ChatThread[];
  profiles: DbProfile[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onStartChat: (userId: string) => void;
  onToggleGroups?: () => void;
  username?: string;
  onNavigate?: (section: NavSection) => void;
}

const ChatSidebar = ({ threads, profiles, activeChatId, onSelectChat, onStartChat, username, onNavigate, onToggleGroups }: ChatSidebarProps) => {
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
    { id: "unread", label: "Unread" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
  };

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between gradient-brand px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <img src={buzzLogo} alt="Buzz" className="h-8 w-8 rounded-xl object-cover shadow-sm lg:hidden" />
          <h1 className="text-lg font-bold text-white tracking-tight">Buzz</h1>
        </div>
        <div className="flex items-center gap-0.5">
          {onToggleGroups && (
            <button onClick={onToggleGroups} className="rounded-full p-2 transition-colors hover:bg-white/20" title="Groups">
              <Users className="h-5 w-5 text-white" />
            </button>
          )}
          <button onClick={() => setShowNewChat(true)} className="rounded-full p-2 transition-colors hover:bg-white/20" title="New Chat">
            <MessageSquarePlus className="h-5 w-5 text-white" />
          </button>
          <Drawer>
            <DrawerTrigger asChild>
              <button className="rounded-full p-2 transition-colors hover:bg-white/20 lg:hidden" title="Menu">
                <Menu className="h-5 w-5 text-white" />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6 space-y-1">
                <div className="flex items-center gap-3 rounded-2xl p-4 mb-3 bg-accent/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-brand text-sm font-bold text-white shadow-sm">
                    {username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">@{username || "user"}</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent">
                  {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-primary" />}
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
                <div className="h-px bg-border my-2" />
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-destructive/10 text-destructive">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Log Out</span>
                </button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 transition-colors focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 px-3 pb-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
              filter === f.id
                ? "gradient-brand text-white shadow-sm"
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <MessageSquarePlus className="h-7 w-7 text-primary/50" />
            </div>
            <p className="text-sm font-medium text-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start chatting with someone!</p>
            <button
              onClick={() => setShowNewChat(true)}
              className="mt-4 rounded-full gradient-brand px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
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

const ThreadItem = ({ thread, isActive, onSelect }: { thread: ChatThread; isActive: boolean; onSelect: (id: string) => void }) => {
  const displayName = thread.profile.display_name || thread.profile.username;
  const initials = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500", "bg-indigo-500", "bg-fuchsia-500", "bg-cyan-500", "bg-blue-600"];
  const colorIndex = thread.profile.username.charCodeAt(0) % colors.length;

  return (
    <button
      onClick={() => onSelect(thread.id)}
      className={`flex w-full items-center gap-3 px-4 py-3 transition-all duration-150 hover:bg-accent/60 ${
        isActive ? "bg-accent" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        {thread.profile.avatar_url ? (
          <img src={thread.profile.avatar_url} alt={displayName} className="h-12 w-12 rounded-full object-cover ring-2 ring-transparent" />
        ) : (
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors[colorIndex]} text-sm font-semibold text-white`}>
            {initials}
          </div>
        )}
        {thread.profile.is_online && (
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-chat-sidebar bg-online" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col text-left">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-semibold text-foreground">{displayName}</span>
          <span className={`ml-2 text-[11px] flex-shrink-0 ${thread.unreadCount > 0 ? "font-semibold text-primary" : "text-muted-foreground"}`}>
            {thread.lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="truncate text-xs text-muted-foreground">{thread.lastMessage}</p>
          {thread.unreadCount > 0 && (
            <span className="ml-2 flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full gradient-brand px-1.5 text-[10px] font-bold text-white">
              {thread.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatSidebar;
