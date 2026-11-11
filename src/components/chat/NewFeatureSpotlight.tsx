import { useEffect, useState } from "react";
import { Copy, Ghost, Inbox, Link2, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Link2, title: "Apna link share karo", text: "Status, bio ya chat mein apna Buzz Guest link daalo." },
  { icon: Ghost, title: "Bina login secret chat", text: "Koi bhi nickname daal ke text ya Ghost Voice note bheje." },
  { icon: Inbox, title: "Live reply karo", text: "Messages Guest Inbox mein turant aate hain, wahin reply karo." },
];

export default function NewFeatureSpotlight({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    supabase.from("profiles").select("username").eq("user_id", userId).maybeSingle().then(({ data }) => setUsername(data?.username ?? ""));
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, [userId]);

  const link = `${window.location.origin}/c/${username}`;
  const status = `🔥 Mujhse secret chat karo — bina app, bina login!\n🎙️ Ghost Voice mein aawaz badal ke bolo.\n👇 ${link}`;
  const copy = async (v: string, msg: string) => { await navigator.clipboard.writeText(v); toast.success(msg); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl p-0">
        <div className="gradient-brand px-6 pb-6 pt-7 text-primary-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/20 px-3 py-1 text-xs font-semibold"><Sparkles className="h-3.5 w-3.5" />Check out new feature</span>
          <DialogTitle className="mt-3 text-2xl font-bold">Buzz Guest Chat Link</DialogTitle>
          <DialogDescription className="mt-1 text-primary-foreground/85">Log aapse anonymous baat kar sakte hain — bina app, bina account.</DialogDescription>
        </div>
        <div className="space-y-3 px-6 pt-5">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary"><s.icon className="h-5 w-5" /></div>
              <div><p className="text-sm font-semibold">{i + 1}. {s.title}</p><p className="text-xs text-muted-foreground">{s.text}</p></div>
            </div>
          ))}
          {username && (
            <button onClick={() => copy(link, "Link copy ho gaya")} className="flex w-full items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2.5 text-left text-xs">
              <span className="truncate font-medium">{link}</span><Copy className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 p-6 pt-4">
          <Button asChild className="gradient-brand"><a href={`https://wa.me/?text=${encodeURIComponent(status)}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-1 h-4 w-4" />WhatsApp</a></Button>
          <Button variant="outline" onClick={() => copy(status, "Status copy ho gaya")}><Copy className="mr-1 h-4 w-4" />Copy status</Button>
          <Button variant="ghost" className="col-span-2" asChild><a href="/guests"><Inbox className="mr-1 h-4 w-4" />Guest Inbox kholo</a></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
