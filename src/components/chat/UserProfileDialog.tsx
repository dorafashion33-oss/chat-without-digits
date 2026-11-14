import { MessageCircle, Phone, Video, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface Props {
  profile: Profile | null;
  onClose: () => void;
  onMessage: (userId: string) => void;
  onCall?: (userId: string, type: "voice" | "video") => void;
}

const UserProfileDialog = ({ profile, onClose, onMessage, onCall }: Props) => {
  const p = profile as (Profile & { bio?: string | null; is_online?: boolean | null }) | null;
  const name = p?.display_name || p?.username || "";
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm overflow-hidden p-0 rounded-3xl border-4 border-[#0a0a0a] bg-white shadow-[0_10px_0_0_#0a0a0a]">
        {p && (
          <>
            <div className="relative border-b-2 border-[#0a0a0a] bg-[#FFF6B8] h-20 p-3 flex justify-end">
              <button
                onClick={onClose}
                className="grid h-7 w-7 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="-mt-10 flex flex-col items-center px-6 pb-6 text-center bz-grid-paper">
              {p.avatar_url ? (
                <img
                  src={p.avatar_url}
                  alt={name}
                  className="h-20 w-20 rounded-2xl border-3 border-[#0a0a0a] object-cover shadow-[0_4px_0_0_#0a0a0a]"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-[#0a0a0a] gradient-brand text-2xl font-black text-white shadow-[0_4px_0_0_#0a0a0a]">
                  {initials}
                </div>
              )}

              <DialogTitle className="mt-3 text-lg font-black text-[#0a0a0a]">{name}</DialogTitle>
              <p className="text-xs font-mono font-bold text-[#5b5b55]">@{p.username}</p>

              {p.is_online != null && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[#0a0a0a] bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                  {p.is_online ? "● ONLINE" : "OFFLINE"}
                </span>
              )}

              <p className="mt-3 text-xs font-medium text-[#5b5b55] bg-white border-2 border-[#0a0a0a] rounded-xl p-3 w-full shadow-[0_2px_0_0_#0a0a0a]">
                {p.bio || "Hey there! I'm using Buzz 💬"}
              </p>

              <div className="mt-5 grid w-full grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onMessage(p.user_id);
                    onClose();
                  }}
                  className="bz-btn bz-btn-yellow py-2.5 flex-col h-auto text-xs font-extrabold"
                >
                  <MessageCircle className="h-4 w-4" /> Message
                </button>
                <button
                  disabled={!onCall}
                  onClick={() => {
                    onCall?.(p.user_id, "voice");
                    onClose();
                  }}
                  className="bz-btn bz-btn-white py-2.5 flex-col h-auto text-xs font-extrabold disabled:opacity-50"
                >
                  <Phone className="h-4 w-4" /> Voice
                </button>
                <button
                  disabled={!onCall}
                  onClick={() => {
                    onCall?.(p.user_id, "video");
                    onClose();
                  }}
                  className="bz-btn bz-btn-white py-2.5 flex-col h-auto text-xs font-extrabold disabled:opacity-50"
                >
                  <Video className="h-4 w-4" /> Video
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
