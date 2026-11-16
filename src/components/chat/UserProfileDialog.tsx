import { MessageCircle, Phone, Video, X, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | (Partial<Profile> & { about?: string | null; bio?: string | null }) | null;
  onClose: () => void;
  onMessage: (userId: string) => void;
  onCall?: (userId: string, type: "voice" | "video") => void;
}

const UserProfileDialog = ({ profile, onClose, onMessage, onCall }: Props) => {
  if (!profile) return null;

  const p = profile as (Profile & { bio?: string | null; about?: string | null });
  const name = p.display_name || p.username || "Buzz User";
  const initials = (name.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2)) || "U";
  const bioText = p.about || p.bio || "Hey there! I'm using Buzz 💬";
  const userId = p.user_id || (p as any).id;

  return (
    <Dialog open={!!profile} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm overflow-hidden p-0 rounded-3xl border-4 border-[#0a0a0a] bg-white shadow-[0_10px_0_0_#0a0a0a]">
        <DialogDescription className="sr-only">User profile card for {name}</DialogDescription>
        
        {/* Banner */}
        <div className="relative border-b-2 border-[#0a0a0a] bg-[#FFF6B8] h-20 p-3 flex justify-between items-center">
          <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#0a0a0a] bg-white px-2 py-0.5 text-[10px] font-black shadow-[0_2px_0_0_#0a0a0a]">
            <ShieldCheck className="h-3 w-3 text-emerald-600" /> End-to-End Verified
          </span>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-red-100 transition-colors"
          >
            <X className="h-4 w-4 stroke-[3]" />
          </button>
        </div>

        {/* Profile Details */}
        <div className="-mt-10 flex flex-col items-center px-6 pb-6 text-center bz-grid-paper">
          {p.avatar_url ? (
            <img
              src={p.avatar_url}
              alt={name}
              className="h-20 w-20 rounded-2xl border-3 border-[#0a0a0a] object-cover shadow-[0_4px_0_0_#0a0a0a] bg-white"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-[#0a0a0a] gradient-brand text-2xl font-black text-white shadow-[0_4px_0_0_#0a0a0a]">
              {initials}
            </div>
          )}

          <DialogTitle className="mt-3 text-xl font-black text-[#0a0a0a] tracking-tight">{name}</DialogTitle>
          <p className="text-xs font-mono font-bold text-[#5b5b55]">@{p.username || "user"}</p>

          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3 py-0.5 text-[10px] font-black text-[#0a0a0a]">
            <span className={`h-2 w-2 rounded-full ${p.is_online ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
            {p.is_online ? "ONLINE NOW" : "OFFLINE"}
          </span>

          <div className="mt-4 text-xs font-semibold text-[#0a0a0a] bg-white border-2 border-[#0a0a0a] rounded-xl p-3 w-full shadow-[0_2px_0_0_#0a0a0a] text-left">
            <p className="text-[10px] font-mono font-black uppercase text-[#5b5b55] mb-1">About / Status</p>
            <p className="leading-relaxed">{bioText}</p>
          </div>

          <div className="mt-5 grid w-full grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (userId) onMessage(userId);
                onClose();
              }}
              className="bz-btn bz-btn-yellow py-2.5 flex-col h-auto text-xs font-black shadow-[0_3px_0_0_#0a0a0a]"
            >
              <MessageCircle className="h-4 w-4" /> Message
            </button>
            <button
              disabled={!onCall || !userId}
              onClick={() => {
                if (userId) onCall?.(userId, "voice");
                onClose();
              }}
              className="bz-btn bz-btn-white py-2.5 flex-col h-auto text-xs font-black shadow-[0_3px_0_0_#0a0a0a] disabled:opacity-40"
            >
              <Phone className="h-4 w-4" /> Voice
            </button>
            <button
              disabled={!onCall || !userId}
              onClick={() => {
                if (userId) onCall?.(userId, "video");
                onClose();
              }}
              className="bz-btn bz-btn-white py-2.5 flex-col h-auto text-xs font-black shadow-[0_3px_0_0_#0a0a0a] disabled:opacity-40"
            >
              <Video className="h-4 w-4" /> Video
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
