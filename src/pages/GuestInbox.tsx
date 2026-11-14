import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Send, Ghost } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
    return () => {
      supabase.removeChannel(ch);
    };
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
    setMsgs((m) => [...m, { id: `tmp-${Date.now()}`, thread_id: active, from_guest: false, text: value, created_at: new Date().toISOString() }]);
    await supabase.from("guest_messages").insert({ thread_id: active, from_guest: false, text: value });
  };

  if (userId === null) {
    return (
      <main className="flex h-screen items-center justify-center bz-grid-paper p-4">
        <div className="bz-card p-6 text-center max-w-sm">
          <p className="text-sm font-bold text-[#0a0a0a]">Log in to read your Guest Inbox</p>
          <a href="/auth" className="bz-btn bz-btn-yellow mt-4 px-6 py-2 text-xs font-bold">
            Log In
          </a>
        </div>
      </main>
    );
  }

  const activeThread = threads.find((t) => t.id === active);

  return (
    <main className="flex h-dvh flex-col bg-white">
      {/* Top Bar */}
      <header className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div>
            <h1 className="text-sm font-black text-[#0a0a0a]">Guest Inbox</h1>
            <p className="text-[10px] font-mono font-bold text-[#5b5b55]">Anonymous replies & Ghost Voice notes</p>
          </div>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(link);
            toast.success("Guest link copied!");
          }}
          className="bz-btn bz-btn-ink px-3 py-1.5 text-xs font-bold"
        >
          <Copy className="h-3 w-3" /> Share Link
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left: Threads */}
        <aside className="w-72 border-r-2 border-[#0a0a0a] bg-[#fffbec] overflow-y-auto p-2 space-y-1.5">
          {threads.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-[#5b5b55]">
              No guest messages yet. Share your link to get secret confessions!
            </div>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl border-2 border-[#0a0a0a] p-2.5 text-left transition-all ${
                  active === t.id ? "bg-[#FCE314] shadow-[0_3px_0_0_#0a0a0a]" : "bg-white hover:bg-[#FFF6B8]"
                }`}
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg border border-[#0a0a0a] bg-white text-xs font-black">
                  👻
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-[#0a0a0a] truncate">{t.nickname}</p>
                  <p className="text-[10px] text-[#5b5b55]">{new Date(t.last_at).toLocaleDateString()}</p>
                </div>
              </button>
            ))
          )}
        </aside>

        {/* Right: Message Window */}
        <section className="flex flex-1 flex-col bg-white">
          {!activeThread ? (
            <div className="flex flex-1 items-center justify-center bz-grid-paper p-6 text-center">
              <div className="bz-card p-6 max-w-xs">
                <Ghost className="h-8 w-8 mx-auto text-[#0a0a0a]" />
                <p className="mt-2 text-xs font-bold text-[#0a0a0a]">Select a guest thread to read & reply</p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b-2 border-[#0a0a0a] bg-[#fffbec] px-4 py-2.5">
                <p className="text-xs font-black text-[#0a0a0a]">Chat with {activeThread.nickname}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bz-grid-paper">
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.from_guest ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-xs font-semibold border-2 border-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] ${
                        m.from_guest ? "bg-white text-[#0a0a0a]" : "bg-[#FCE314] text-[#0a0a0a]"
                      }`}
                    >
                      <MessageText text={m.text} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-[#0a0a0a] bg-[#fffbec] p-3 flex gap-2">
                <div className="flex flex-1 items-center rounded-full border-2 border-[#0a0a0a] bg-white px-4 py-2 shadow-[0_2px_0_0_#0a0a0a]">
                  <input
                    value={text}
                    placeholder={`Reply to ${activeThread.nickname}...`}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && reply()}
                    className="w-full bg-transparent text-xs font-semibold text-[#0a0a0a] outline-none"
                  />
                </div>
                <button
                  onClick={reply}
                  className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
