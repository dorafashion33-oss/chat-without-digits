import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { id: string; from_guest: boolean; text: string; created_at: string };
type Session = { thread: string; token: string; owner: string };

const key = (u: string) => `buzz:guest:${u.toLowerCase()}`;

export default function GuestChat() {
  const { username = "" } = useParams();
  const [session, setSession] = useState<Session | null>(() => {
    try { return JSON.parse(localStorage.getItem(key(username)) || "null"); } catch { return null; }
  });
  const [nick, setNick] = useState("");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = `Chat with @${username} on Buzz`; }, [username]);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase.rpc("guest_fetch", { _thread: session.thread, _token: session.token });
      if (!alive) return;
      if (error) { localStorage.removeItem(key(username)); setSession(null); return; }
      setMsgs((prev) => (prev.length === data.length ? prev : data));
    };
    load();
    const t = setInterval(() => { if (!document.hidden) load(); }, 4000);
    return () => { alive = false; clearInterval(t); };
  }, [session, username]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const start = async () => {
    setError("");
    const { data, error } = await supabase.rpc("guest_start", { _username: username, _nickname: nick });
    if (error || !data?.[0]) { setError("Ye @username Buzz par nahi mila."); return; }
    const s = { thread: data[0].thread_id, token: data[0].token, owner: data[0].owner_name };
    localStorage.setItem(key(username), JSON.stringify(s));
    setSession(s);
  };

  const send = async () => {
    const value = text.trim();
    if (!value || !session) return;
    setText("");
    setMsgs((m) => [...m, { id: `tmp-${Date.now()}`, from_guest: true, text: value, created_at: new Date().toISOString() }]);
    const { error } = await supabase.rpc("guest_send", { _thread: session.thread, _token: session.token, _text: value });
    if (error) setError("Message nahi gaya, dobara try karein.");
  };

  if (!session) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full gradient-brand text-2xl font-bold text-primary-foreground">
            {username[0]?.toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-foreground">Chat with @{username}</h1>
          <p className="text-sm text-muted-foreground">No login, no phone number. Just pick a nickname.</p>
          <Input placeholder="Your nickname (optional)" value={nick} maxLength={30} onChange={(e) => setNick(e.target.value)} onKeyDown={(e) => e.key === "Enter" && start()} />
          <Button className="w-full" onClick={start}>Start chatting</Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col bg-background">
      <header className="gradient-brand px-4 py-3 text-primary-foreground">
        <p className="font-semibold">{session.owner}</p>
        <p className="text-xs opacity-80">@{username} · guest chat</p>
      </header>
      <a href="/" className="bg-accent px-4 py-2 text-center text-xs text-accent-foreground">
        Save this chat forever? Claim your own @username on Buzz →
      </a>
      <div className="chat-messages-shell flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {msgs.length === 0 && <p className="pt-10 text-center text-sm text-muted-foreground">Say hi to @{username} 👋</p>}
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.from_guest ? "justify-end" : "justify-start"}`}>
              <p className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${m.from_guest ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border"}`}>{m.text}</p>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
      {error && <p className="px-4 text-xs text-destructive">{error}</p>}
      <div className="flex gap-2 border-t bg-card p-3">
        <Input value={text} maxLength={2000} placeholder="Type a message" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <Button size="icon" onClick={send} aria-label="Send"><Send className="h-4 w-4" /></Button>
      </div>
    </main>
  );
}
