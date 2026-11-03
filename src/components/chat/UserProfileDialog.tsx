import { MessageCircle, Phone, Video } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="max-w-sm overflow-hidden p-0">
        {p && (
          <>
            <div className="gradient-brand h-24" />
            <div className="-mt-12 flex flex-col items-center px-6 pb-6 text-center">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt={name} className="h-24 w-24 rounded-full border-4 border-background object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-primary text-2xl font-bold text-primary-foreground">{initials}</div>
              )}
              <DialogTitle className="mt-3 text-xl">{name}</DialogTitle>
              <p className="text-sm text-muted-foreground">@{p.username}</p>
              {p.is_online != null && (
                <p className="mt-1 text-xs text-muted-foreground">{p.is_online ? "● Online" : "Offline"}</p>
              )}
              <p className="mt-3 text-sm text-foreground">{p.bio || "Hey there! I'm using Buzz 💬"}</p>
              <div className="mt-5 grid w-full grid-cols-3 gap-2">
                <Button onClick={() => { onMessage(p.user_id); onClose(); }} className="flex-col h-auto py-3 gap-1"><MessageCircle className="h-5 w-5" />Message</Button>
                <Button variant="outline" disabled={!onCall} onClick={() => { onCall?.(p.user_id, "voice"); onClose(); }} className="flex-col h-auto py-3 gap-1"><Phone className="h-5 w-5" />Voice</Button>
                <Button variant="outline" disabled={!onCall} onClick={() => { onCall?.(p.user_id, "video"); onClose(); }} className="flex-col h-auto py-3 gap-1"><Video className="h-5 w-5" />Video</Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
