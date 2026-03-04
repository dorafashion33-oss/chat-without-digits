import { useState } from "react";
import { Search, MessageSquarePlus, X } from "lucide-react";
import type { DbProfile } from "@/hooks/useRealtimeMessages";

interface NewChatDialogProps {
  profiles: DbProfile[];
  onSelect: (userId: string) => void;
  onClose: () => void;
}

const NewChatDialog = ({ profiles, onSelect, onClose }: NewChatDialogProps) => {
  const [search, setSearch] = useState("");

  const filtered = profiles.filter(
    (p) =>
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      (p.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500",
    "bg-indigo-500", "bg-fuchsia-500", "bg-cyan-500", "bg-blue-600",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-background border border-border shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold gradient-brand-text">New Chat</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-accent">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto px-2 pb-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No users found</p>
          ) : (
            filtered.map((profile) => {
              const ci = profile.username.charCodeAt(0) % colors.length;
              const initials = (profile.display_name || profile.username)
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <button
                  key={profile.user_id}
                  onClick={() => onSelect(profile.user_id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors[ci]} text-xs font-semibold text-white`}>
                    {initials}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{profile.display_name || profile.username}</p>
                    <p className="text-xs text-muted-foreground">@{profile.username}</p>
                  </div>
                  {profile.is_online && (
                    <div className="ml-auto h-2.5 w-2.5 rounded-full bg-online" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatDialog;
