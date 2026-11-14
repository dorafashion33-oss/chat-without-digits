import { Search, MessageSquarePlus, Menu, Settings, User, Moon, Sun, Users, LogOut, Pin, PinOff, FolderPlus, MoreVertical, Check, X, Download } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import NewChatDialog from "./NewChatDialog";
import InstallAppDialog from "./InstallAppDialog";
import type { ChatThread, DbProfile } from "@/hooks/useRealtimeMessages";
import type { NavSection } from "./NavIconBar";
import buzzLogo from "@/assets/buzz-logo.jpeg";

const DEFAULT_FOLDERS = ["Work", "Family", "Friends"] as const;
const PINS_KEY = "buzz:pinned-chats";
const FOLDERS_KEY = "buzz:custom-folders";
const FOLDER_ASSIGN_KEY = "buzz:folder-assignments";

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

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const ChatSidebar = ({
  threads,
  profiles,
  activeChatId,
  onSelectChat,
  onStartChat,
  username,
  onNavigate,
  onToggleGroups,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>("All");
  const [showNewChat, setShowNewChat] = useState(false);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [pinned, setPinned] = useState<string[]>(() => readJSON<string[]>(PINS_KEY, []));
  const [customFolders, setCustomFolders] = useState<string[]>(() => readJSON<string[]>(FOLDERS_KEY, []));
  const [assignments, setAssignments] = useState<Record<string, string>>(() => readJSON<Record<string, string>>(FOLDER_ASSIGN_KEY, {}));
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    localStorage.setItem(PINS_KEY, JSON.stringify(pinned));
  }, [pinned]);
  useEffect(() => {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(customFolders));
  }, [customFolders]);
  useEffect(() => {
    localStorage.setItem(FOLDER_ASSIGN_KEY, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  const allFolders = useMemo(() => ["All", "Unread", ...DEFAULT_FOLDERS, ...customFolders], [customFolders]);

  const filtered = useMemo(() => {
    return threads.filter((t) => {
      const name = t.profile?.display_name || t.profile?.username || "";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFolder === "All") return true;
      if (activeFolder === "Unread") return t.unreadCount > 0;
      return assignments[t.id] === activeFolder;
    });
  }, [threads, searchQuery, activeFolder, assignments]);

  const { pinnedThreads, otherThreads } = useMemo(() => {
    const p: ChatThread[] = [];
    const o: ChatThread[] = [];
    for (const t of filtered) (pinned.includes(t.id) ? p : o).push(t);
    return { pinnedThreads: p, otherThreads: o };
  }, [filtered, pinned]);

  const togglePin = (id: string) => {
    setPinned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    toast.success(pinned.includes(id) ? "Chat unpinned" : "Chat pinned");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
  };

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0">
      {/* Neo-Brutalist Header */}
      <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-2">
          <img src={buzzLogo} alt="Buzz" className="h-8 w-8 rounded-lg border border-[#0a0a0a] object-cover lg:hidden" />
          <h1 className="text-lg font-black text-[#0a0a0a] tracking-tight flex items-center gap-1.5">
            Buzz Streams <span className="text-xs">🇮🇳</span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          {onToggleGroups && (
            <button
              onClick={onToggleGroups}
              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FCE314]"
              title="Groups"
            >
              <Users className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowNewChat(true)}
            className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:translate-y-[-1px]"
            title="New Chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tactile Search Bar */}
      <div className="p-3 border-b-2 border-[#0a0a0a]/15 bg-white">
        <div className="flex items-center gap-2 rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] px-3 py-2 shadow-[0_2px_0_0_#0a0a0a]">
          <Search className="h-4 w-4 text-[#0a0a0a]/60 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-transparent text-xs font-semibold text-[#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
          />
        </div>
      </div>

      {/* Folder Chips */}
      <div className="flex gap-1.5 overflow-x-auto p-2.5 border-b-2 border-[#0a0a0a]/15 no-scrollbar bg-[#fffbec]">
        {allFolders.map((f) => {
          const isActive = activeFolder === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition-all border-2 border-[#0a0a0a] ${
                isActive
                  ? "bg-[#0a0a0a] text-white shadow-[0_2px_0_0_#0a0a0a]"
                  : "bg-white text-[#0a0a0a] hover:bg-[#FFF6B8]"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs font-bold text-[#5b5b55]">No conversations found</p>
            <button
              onClick={() => setShowNewChat(true)}
              className="bz-btn bz-btn-yellow mt-3 px-4 py-1.5 text-xs font-bold"
            >
              Start new chat
            </button>
          </div>
        ) : (
          [...pinnedThreads, ...otherThreads].map((t) => {
            const isSelected = activeChatId === t.id;
            const name = t.profile?.display_name || t.profile?.username || "Unknown";
            const lastMsg = t.messages[t.messages.length - 1]?.text || "No messages yet";

            return (
              <div
                key={t.id}
                onClick={() => onSelectChat(t.id)}
                className={`flex items-center gap-3 rounded-2xl p-3 cursor-pointer transition-all border-2 ${
                  isSelected
                    ? "border-[#0a0a0a] bg-[#FFF6B8] shadow-[0_4px_0_0_#0a0a0a]"
                    : "border-transparent bg-white/70 hover:border-[#0a0a0a] hover:bg-white hover:shadow-[0_2px_0_0_#0a0a0a]"
                }`}
              >
                <div className="relative">
                  <div className="h-11 w-11 rounded-full border-2 border-[#0a0a0a] gradient-brand flex items-center justify-center text-white font-extrabold text-sm shadow-[0_2px_0_0_#0a0a0a]">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  {t.profile?.is_online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border border-[#0a0a0a] bg-emerald-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-[#0a0a0a] truncate">@{name}</p>
                    {pinned.includes(t.id) && <Pin className="h-3 w-3 text-[#0a0a0a]" />}
                  </div>
                  <p className="text-[11px] font-medium text-[#5b5b55] truncate mt-0.5">{lastMsg}</p>
                </div>

                {t.unreadCount > 0 && (
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-[#0a0a0a] bg-[#FCE314] text-[10px] font-black text-[#0a0a0a] shadow-[0_1px_0_0_#0a0a0a]">
                    {t.unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <NewChatDialog
        open={showNewChat}
        onOpenChange={setShowNewChat}
        profiles={profiles}
        onSelectUser={onStartChat}
      />
    </div>
  );
};

export default ChatSidebar;
