import { Search, MessageSquarePlus, Pin } from "lucide-react";
import { useState } from "react";
import type { Chat } from "@/data/mockData";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

const ChatSidebar = ({ chats, activeChatId, onSelectChat }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = chats.filter(
    (c) =>
      c.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned = filtered.filter((c) => c.isPinned);
  const unpinned = filtered.filter((c) => !c.isPinned);

  return (
    <div className="flex h-full flex-col bg-chat-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">Chats</h1>
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
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
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
    "bg-primary", "bg-emerald-500", "bg-sky-500", "bg-amber-500",
    "bg-rose-500", "bg-violet-500", "bg-cyan-500", "bg-orange-500",
  ];
  const colorIndex = chat.user.id.charCodeAt(0) % colors.length;

  return (
    <button
      onClick={() => onSelect(chat.id)}
      className={`flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60 ${
        isActive ? "bg-accent" : ""
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors[colorIndex]} text-sm font-semibold text-white`}>
          {chat.user.avatar}
        </div>
        {chat.user.isOnline && (
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-chat-sidebar bg-online" />
        )}
      </div>

      {/* Info */}
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
            <span className="ml-2 flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatSidebar;
