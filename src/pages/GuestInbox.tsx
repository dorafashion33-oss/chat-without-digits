import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageText } from "@/components/chat/GhostVoiceBubble";

type Thread = { id: string; nickname: string; last_at: string };
type Msg = { id: string; thread_id: string; from_guest: boolean; text: string; created_at: string };

export default function GuestInbox() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [username, setUsername] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const activeRef = useRef<string | null>(null);
  activeRef.current = active;

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const id = data.session?.user.id ?? null;
      setUserId(id);
      if (!id) return;
      const { data: p } = await supabase.from("profiles").select("username").eq("user_id", id).maybeSingle();
      setUsername(p?.username ?? "");
    });
  }, []);

  const loadThreads = async () => {
    const { data } = await supabase.from("guest_threads").select("id,nickname,last_at").order("last_at", { ascending: false });
    setThreads(data ?? []);
  };

  useEffect(() => {
    if (!userId) return;
    loadThreads();
    const ch = supabase
      .channel(`guest-inbox-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guest_messages" }, (payload) => {
        const m = payload.new as Msg;
        setMsgs((prev) => (m.thread_id !== activeRef.current || prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        loadThreads();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId]);

  useEffect(() => {
    if (!active) return;
    supabase.from("guest_messages").select("*").eq("thread_id", active).order("created_at").then(({ data }) => setMsgs(data ?? []));
  }, [active]);

  const link = `${window.location.origin}/c/${username}`;
  const reply = async () => {
    const value = text.trim();
    if (!value || !active) return;
    setText("");
    const { data, error } = await supabase.from("guest_messages").insert({ thread_id: active, from_guest: false, text: value }).select().single();
    if (error) return toast.error("Reply nahi gaya");
    setMsgs((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data]));
  };

  if (userId === undefined) return null;
  if (!userId) {
    return <main className="flex min-h-dvh items-center justify-center p-6 text-center"><a href="/" className="text-primary underline">Pehle Buzz mein login karein</a></main>;
  }

  const thread = threads.find((t) => t.id === active);

  return (
    <main className="flex h-dvh flex-col bg-background">
      <header className="flex items-center gap-2 gradient-brand px-4 py-3 text-primary-foreground">
        <button aria-label="Back" onClick={() => (active ? setActive(null) : (window.location.href = "/"))}><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-semibold">{thread ? thread.nickname : "Guest chats"}</h1>
      </header>
      {!active ? (
        <div className="flex-1 overflow-y-auto">
          <div className="m-4 space-y-2 rounded-2xl border bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Your guest link</p>
            <p className="text-xs text-muted-foreground">Share it on Instagram or anywhere. People can message you without login or phone number.</p>
            <div className="flex gap-2">
              <Input readOnly value={link} />
              <Button size="icon" aria-label="Copy link" onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied"); }}><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
          {threads.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Abhi koi guest message nahi aaya.</p>}
          {threads.map((t) => (
            <button key={t.id} onClick={() => setActive(t.id)} className="flex w-full items-center gap-3 border-b px-4 py-3 text-left hover:bg-accent/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">{t.nickname[0]?.toUpperCase()}</div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.nickname}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.last_at).toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.from_guest ? "justify-start" : "justify-end"}`}>
                <p className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${m.from_guest ? "border bg-card text-card-foreground" : "bg-primary text-primary-foreground"}`}><MessageText text={m.text} /></p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t bg-card p-3">
            <Input value={text} placeholder="Reply" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && reply()} />
            <Button size="icon" onClick={reply} aria-label="Send"><Send className="h-4 w-4" /></Button>
          </div>
        </>
      )}
    </main>
  );
}
