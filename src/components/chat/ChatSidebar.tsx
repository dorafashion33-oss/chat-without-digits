import { Search, MessageSquarePlus, Menu, Settings, User, Moon, Sun, Users, LogOut, Pin, PinOff, FolderPlus, MoreVertical, Check, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import NewChatDialog from "./NewChatDialog";
import type { ChatThread, DbProfile } from "@/hooks/useRealtimeMessages";
import type { NavSection } from "./NavIconBar";
import buzzLogo from "@/assets/buzz-logo.jpeg";

const DEFAULT_FOLDERS = ["Work", "Family", "Friends"] as const;
const PINS_KEY = "buzz:pinned-chats";
const FOLDERS_KEY = "buzz:custom-folders";
const FOLDER_ASSIGN_KEY = "buzz:folder-assignments"; // { [threadId]: folderName }

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
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
};

const ChatSidebar = ({ threads, profiles, activeChatId, onSelectChat, onStartChat, username, onNavigate, onToggleGroups }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>("All");
  const [showNewChat, setShowNewChat] = useState(false);
  const [pinned, setPinned] = useState<string[]>(() => readJSON<string[]>(PINS_KEY, []));
  const [customFolders, setCustomFolders] = useState<string[]>(() => readJSON<string[]>(FOLDERS_KEY, []));
  const [assignments, setAssignments] = useState<Record<string, string>>(() => readJSON<Record<string, string>>(FOLDER_ASSIGN_KEY, {}));
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => { localStorage.setItem(PINS_KEY, JSON.stringify(pinned)); }, [pinned]);
  useEffect(() => { localStorage.setItem(FOLDERS_KEY, JSON.stringify(customFolders)); }, [customFolders]);
  useEffect(() => { localStorage.setItem(FOLDER_ASSIGN_KEY, JSON.stringify(assignments)); }, [assignments]);

  const allFolders = useMemo(() => ["All", "Unread", ...DEFAULT_FOLDERS, ...customFolders], [customFolders]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return threads.filter((t) => {
      // folder filter
      if (activeFolder === "Unread") {
        if (t.unreadCount === 0) return false;
      } else if (activeFolder !== "All") {
        if (assignments[t.id] !== activeFolder) return false;
      }
      if (!q) return true;
      const name = (t.profile.display_name || t.profile.username).toLowerCase();
      const user = t.profile.username.toLowerCase();
      if (name.includes(q) || user.includes(q)) return true;
      // message content search
      return t.messages.some((m) => m.text?.toLowerCase().includes(q));
    });
  }, [threads, searchQuery, activeFolder, assignments]);

  const { pinnedThreads, otherThreads } = useMemo(() => {
    const p: ChatThread[] = [];
    const o: ChatThread[] = [];
    for (const t of filtered) (pinned.includes(t.id) ? p : o).push(t);
    return { pinnedThreads: p, otherThreads: o };
  }, [filtered, pinned]);

  const togglePin = (id: string) => {
    setPinned((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    toast.success(pinned.includes(id) ? "Chat unpinned" : "Chat pinned");
  };

  const assignFolder = (threadId: string, folder: string | null) => {
    setAssignments((prev) => {
      const next = { ...prev };
      if (folder) next[threadId] = folder; else delete next[threadId];
      return next;
    });
    toast.success(folder ? `Moved to ${folder}` : "Removed from folder");
  };

  const addCustomFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    if (allFolders.includes(name)) { toast.error("Folder already exists"); return; }
    setCustomFolders((p) => [...p, name]);
    setNewFolderName("");
    setNewFolderOpen(false);
    toast.success(`Created "${name}"`);
  };

  const deleteCustomFolder = (name: string) => {
    setCustomFolders((p) => p.filter((f) => f !== name));
    setAssignments((prev) => {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(prev)) if (v !== name) next[k] = v;
      return next;
    });
    if (activeFolder === name) setActiveFolder("All");
  };

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
            placeholder="Search chats & messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Folder chips */}
      <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-thin">
        {allFolders.map((f) => {
          const isCustom = customFolders.includes(f);
          return (
            <div key={f} className="relative flex-shrink-0 group">
              <button
                onClick={() => setActiveFolder(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  activeFolder === f ? "gradient-brand text-white shadow-sm" : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                {f}
                {isCustom && (
                  <span
                    onClick={(e) => { e.stopPropagation(); deleteCustomFolder(f); }}
                    className="ml-1.5 opacity-60 hover:opacity-100 cursor-pointer"
                    role="button"
                    aria-label={`Delete ${f}`}
                  >
                    ×
                  </span>
                )}
              </button>
            </div>
          );
        })}
        <button
          onClick={() => setNewFolderOpen(true)}
          className="flex-shrink-0 rounded-full px-2.5 py-1.5 bg-secondary text-muted-foreground hover:bg-accent transition"
          title="New folder"
        >
          <FolderPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      {newFolderOpen && (
        <div className="px-3 pb-2 flex gap-2">
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCustomFolder(); if (e.key === "Escape") setNewFolderOpen(false); }}
            placeholder="Folder name"
            className="flex-1 rounded-lg bg-secondary px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button onClick={addCustomFolder} className="rounded-lg gradient-brand px-3 text-white"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={() => { setNewFolderOpen(false); setNewFolderName(""); }} className="rounded-lg bg-secondary px-3"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <MessageSquarePlus className="h-7 w-7 text-primary/50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {searchQuery ? "No matches" : activeFolder === "All" ? "No conversations yet" : `No chats in ${activeFolder}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? "Try a different search" : "Start chatting with someone!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-4 rounded-full gradient-brand px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
              >
                Start a chat
              </button>
            )}
          </div>
        ) : (
          <>
            {pinnedThreads.length > 0 && (
              <>
                <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Pin className="h-3 w-3" /> Pinned
                </div>
                {pinnedThreads.map((t) => (
                  <ThreadItem
                    key={t.id}
                    thread={t}
                    isActive={t.id === activeChatId}
                    isPinned
                    folders={[...DEFAULT_FOLDERS, ...customFolders]}
                    currentFolder={assignments[t.id] || null}
                    onSelect={onSelectChat}
                    onTogglePin={togglePin}
                    onAssignFolder={assignFolder}
                    highlight={searchQuery}
                  />
                ))}
                {otherThreads.length > 0 && (
                  <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">All chats</div>
                )}
              </>
            )}
            {otherThreads.map((t) => (
              <ThreadItem
                key={t.id}
                thread={t}
                isActive={t.id === activeChatId}
                isPinned={false}
                folders={[...DEFAULT_FOLDERS, ...customFolders]}
                currentFolder={assignments[t.id] || null}
                onSelect={onSelectChat}
                onTogglePin={togglePin}
                onAssignFolder={assignFolder}
                highlight={searchQuery}
              />
            ))}
          </>
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

interface ThreadItemProps {
  thread: ChatThread;
  isActive: boolean;
  isPinned: boolean;
  folders: string[];
  currentFolder: string | null;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onAssignFolder: (id: string, folder: string | null) => void;
  highlight: string;
}

const ThreadItem = ({ thread, isActive, isPinned, folders, currentFolder, onSelect, onTogglePin, onAssignFolder, highlight }: ThreadItemProps) => {
  const displayName = thread.profile.display_name || thread.profile.username;
  const initials = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500", "bg-indigo-500", "bg-fuchsia-500", "bg-cyan-500", "bg-blue-600"];
  const colorIndex = thread.profile.username.charCodeAt(0) % colors.length;

  // Show matched message preview when searching
  const preview = (() => {
    if (!highlight.trim()) return thread.lastMessage;
    const q = highlight.toLowerCase();
    const match = [...thread.messages].reverse().find((m) => m.text?.toLowerCase().includes(q));
    return match?.text || thread.lastMessage;
  })();

  return (
    <div
      className={`group relative flex w-full items-center gap-3 px-4 py-3 transition-all duration-150 hover:bg-accent/60 ${
        isActive ? "bg-accent" : ""
      }`}
    >
      <button onClick={() => onSelect(thread.id)} className="flex flex-1 items-center gap-3 text-left min-w-0">
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
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-foreground flex items-center gap-1">
              {displayName}
              {isPinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
              {currentFolder && (
                <span className="text-[9px] rounded-full bg-primary/15 text-primary px-1.5 py-0.5 font-medium flex-shrink-0">
                  {currentFolder}
                </span>
              )}
            </span>
            <span className={`text-[11px] flex-shrink-0 ${thread.unreadCount > 0 ? "font-semibold text-primary" : "text-muted-foreground"}`}>
              {thread.lastMessageTime}
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="truncate text-xs text-muted-foreground">{preview}</p>
            {thread.unreadCount > 0 && (
              <span className="ml-2 flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full gradient-brand px-1.5 text-[10px] font-bold text-white">
                {thread.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 rounded-full p-1.5 hover:bg-background/60 transition"
            onClick={(e) => e.stopPropagation()}
            aria-label="Chat options"
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onTogglePin(thread.id)}>
            {isPinned ? <><PinOff className="h-4 w-4 mr-2" /> Unpin chat</> : <><Pin className="h-4 w-4 mr-2" /> Pin chat</>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">Move to folder</DropdownMenuLabel>
          {folders.map((f) => (
            <DropdownMenuItem key={f} onClick={() => onAssignFolder(thread.id, f)}>
              {currentFolder === f && <Check className="h-4 w-4 mr-2" />}
              <span className={currentFolder === f ? "font-semibold" : ""}>{f}</span>
            </DropdownMenuItem>
          ))}
          {currentFolder && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAssignFolder(thread.id, null)} className="text-destructive">
                <X className="h-4 w-4 mr-2" /> Remove from folder
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatSidebar;
