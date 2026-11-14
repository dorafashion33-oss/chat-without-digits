import { useState } from "react";
import { Search, X, MessageSquarePlus, User } from "lucide-react";
import type { DbProfile } from "@/hooks/useRealtimeMessages";

interface NewChatDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  profiles: DbProfile[];
  onSelect?: (userId: string) => void;
  onSelectUser?: (userId: string) => void;
}

const NewChatDialog = ({
  open,
  onOpenChange,
  onClose,
  profiles,
  onSelect,
  onSelectUser,
}: NewChatDialogProps) => {
  const [search, setSearch] = useState("");

  // Agar explicitly open false hai toh render mat karo
  if (open === false) return null;

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleSelect = (userId: string) => {
    if (onSelectUser) onSelectUser(userId);
    if (onSelect) onSelect(userId);
    handleClose();
  };

  const filtered = profiles.filter(
    (p) =>
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      (p.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border-4 border-[#0a0a0a] bg-white shadow-[0_10px_0_0_#0a0a0a] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-[#0a0a0a]" />
            <h2 className="text-sm font-black text-[#0a0a0a] uppercase tracking-wide">
              Start New Chat
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="grid h-7 w-7 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-red-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b-2 border-[#0a0a0a]/15 bg-[#fffbec]">
          <div className="flex items-center gap-2 rounded-xl border-2 border-[#0a0a0a] bg-white px-3 py-2 shadow-[0_2px_0_0_#0a0a0a]">
            <Search className="h-4 w-4 text-[#0a0a0a]/60 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
              autoFocus
            />
          </div>
        </div>

        {/* Users List */}
        <div className="max-h-[320px] overflow-y-auto p-2 space-y-1.5 bz-grid-paper">
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs font-bold text-[#5b5b55]">No usernames found</p>
              <p className="text-[11px] text-[#5b5b55]/80 mt-1">
                Ask your friend for their unique Buzz @handle
              </p>
            </div>
          ) : (
            filtered.map((profile) => {
              const displayName = profile.display_name || profile.username;
              const initials = displayName.slice(0, 2).toUpperCase();

              return (
                <button
                  key={profile.user_id}
                  onClick={() => handleSelect(profile.user_id)}
                  className="flex w-full items-center gap-3 rounded-xl border-2 border-[#0a0a0a] bg-white p-2.5 text-left transition-all hover:-translate-y-0.5 hover:bg-[#FFF6B8] hover:shadow-[0_4px_0_0_#0a0a0a]"
                >
                  <div className="relative">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] gradient-brand text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a]">
                      {initials}
                    </div>
                    {profile.is_online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[#0a0a0a] bg-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-[#0a0a0a] truncate">{displayName}</p>
                    <p className="text-[11px] font-mono text-[#5b5b55] truncate">@{profile.username}</p>
                  </div>
                  {profile.is_online && (
                    <span className="rounded-md border border-[#0a0a0a] bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      online
                    </span>
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
