import { useMemo, useState } from "react";
import { Forward, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <Dialog open={open} onOpenChange={(nextOpen) => nextOpen ? onOpenChange(true) : close()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-4 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Forward className="h-4 w-4 text-primary" /> Forward message</DialogTitle>
          <DialogDescription className="line-clamp-2 break-words">{messageText.replace(/^\[reply:.*?\]/s, "").slice(0, 180)}</DialogDescription>
        </DialogHeader>
        <label className="flex items-center gap-2 rounded-md border bg-background px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people" className="border-0 px-0 focus-visible:ring-0" />
        </label>
        <div className="max-h-[min(55vh,24rem)] overflow-y-auto">
          {visibleProfiles.length ? visibleProfiles.map((profile) => {
            const name = profile.display_name || profile.username;
            return (
              <div key={profile.user_id} className="flex items-center gap-3 border-b py-2 last:border-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{name.slice(0, 1).toUpperCase()}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
                </div>
                <Button size="sm" onClick={() => { onForward(profile.user_id, messageText); close(); }}>Send</Button>
              </div>
            );
          }) : <p className="py-8 text-center text-sm text-muted-foreground">No people found</p>}
        </div>
        <div className="flex justify-end border-t pt-3">
          <Button variant="outline" onClick={close}>Back</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageForwardDialog;