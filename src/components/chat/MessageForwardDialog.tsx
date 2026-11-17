import { useMemo, useState } from "react";
import { Forward, Search, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface ForwardRecipient {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MessageForwardDialogProps {
  open: boolean;
  profiles: ForwardRecipient[];
  messageText: string;
  onOpenChange: (open: boolean) => void;
  onForward: (receiverId: string, text: string) => void;
}

const MessageForwardDialog = ({ open, profiles, messageText, onOpenChange, onForward }: MessageForwardDialogProps) => {
  const [query, setQuery] = useState("");

  // Only filter from already-chatted users provided in profiles
  const visibleProfiles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return profiles;
    return profiles.filter((profile) =>
      `${profile.display_name || ""} ${profile.username}`.toLowerCase().includes(normalized),
    );
  }, [profiles, query]);

  const close = () => {
    setQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : close())}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-4 border-2 border-[#0a0a0a] bg-[#FFFDF7] p-5 shadow-[4px_4px_0_0_#0a0a0a] sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-base font-black uppercase text-[#0a0a0a]">
            <Forward className="h-5 w-5 text-[#0a0a0a]" /> Forward Message
          </DialogTitle>
          <DialogDescription className="line-clamp-2 rounded-lg border-2 border-[#0a0a0a] bg-white p-2 text-xs font-bold text-[#0a0a0a] shadow-[2px_2px_0_0_#0a0a0a]">
            "{messageText.replace(/^\[reply:.*?\]/s, "").replace(/^\[poll:.*?\]/s, "[Poll]").slice(0, 140)}"
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a0a0a]/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chatted users..."
            className="rounded-xl border-2 border-[#0a0a0a] bg-white pl-9 text-xs font-bold shadow-[2px_2px_0_0_#0a0a0a] focus-visible:ring-0"
          />
        </div>

        <div className="max-h-[min(50vh,22rem)] space-y-2 overflow-y-auto pr-1">
          <div className="flex items-center justify-between px-1 text-[11px] font-black uppercase tracking-wider text-[#0a0a0a]/70">
            <span>Recent Chats ({visibleProfiles.length})</span>
            <span className="flex items-center gap-1">
              <UserCheck className="h-3 w-3" /> Chatted Only
            </span>
          </div>

          {visibleProfiles.length > 0 ? (
            visibleProfiles.map((profile) => {
              const name = profile.display_name || profile.username;
              return (
                <button
                  key={profile.user_id}
                  onClick={() => {
                    onForward(profile.user_id, messageText);
                    close();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border-2 border-[#0a0a0a] bg-white p-2.5 text-left shadow-[2px_2px_0_0_#0a0a0a] transition-all hover:-translate-y-0.5 hover:bg-[#FFF6B8]"
                >
                  <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#0a0a0a] bg-[#FCE314] text-xs font-black">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-[#0a0a0a]">{name}</p>
                    <p className="truncate text-[11px] font-bold text-[#0a0a0a]/60">@{profile.username}</p>
                  </div>
                  <span className="shrink-0 rounded-lg border-2 border-[#0a0a0a] bg-[#0a0a0a] px-2.5 py-1 text-[11px] font-black uppercase text-white shadow-[1px_1px_0_0_#0a0a0a]">
                    Send
                  </span>
                </button>
              );
            })
          ) : (
            <div className="rounded-xl border-2 border-dashed border-[#0a0a0a]/30 p-6 text-center">
              <p className="text-xs font-bold text-[#0a0a0a]/70">No chatted user found.</p>
              <p className="mt-1 text-[11px] font-medium text-[#0a0a0a]/50">
                You can only forward to contacts you have active conversations with.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageForwardDialog;
