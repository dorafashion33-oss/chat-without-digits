import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Send, Ghost, QrCode, Search, Check, Sparkles, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageText } from "@/components/chat/GhostVoiceBubble";

type Thread = { id: string; nickname: string; last_at: string };
type Msg = { id: string; thread_id: string; from_guest: boolean; text: string; created_at: string };

export default function GuestInbox() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [username, setUsername] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
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

  const guestLink = `https://buzzofficial.vercel.app/c/${username}`;

  const copyGuestLink = () => {
    navigator.clipboard.writeText(guestLink);
    setCopied(true);
    toast.success("Secret chat link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#EDE9FE] shadow-[0_3px_0_0_#0a0a0a]">
            <Ghost className="h-6 w-6 text-[#7C3AED]" />
          </div>
          <p className="text-base font-black text-[#0a0a0a]">Log in to read your Guest Inbox</p>
          <p className="mt-1 text-xs text-[#5b5b55]">View secret confessions and anonymous ghost voice notes sent to your profile.</p>
          <a href="/auth" className="bz-btn bz-btn-yellow mt-4 w-full py-2.5 text-xs font-bold inline-block">
            Log In to Buzz
          </a>
        </div>
      </main>
    );
  }

  const filteredThreads = threads.filter((t) =>
    t.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeThread = threads.find((t) => t.id === active);

  return (
    <main className="flex h-dvh flex-col bg-[#FAF9F6]">
      {/* Top Header */}
      <header className="border-b-2 border-[#0a0a0a] bg-[#EDE9FE] px-4 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <a
            href="/"
            className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FAF9F6]"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-[#0a0a0a] tracking-tight">Ghost Inbox</h1>
              <span className="rounded-full border border-[#0a0a0a] bg-[#7C3AED] px-1.5 py-0.2 text-[9px] font-black text-white">
                SECRET
              </span>
            </div>
            <p className="text-[10px] font-mono font-bold text-[#5b5b55]">Anonymous confessions & Ghost Voice</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border-2 border-[#0a0a0a] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FAF9F6]"
          >
            <QrCode className="h-3.5 w-3.5 text-[#7C3AED]" /> QR
          </button>
          <button
            onClick={copyGuestLink}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#0a0a0a] bg-[#0a0a0a] px-3 py-1.5 text-xs font-bold text-white shadow-[0_2px_0_0_#7C3AED] hover:bg-[#222]"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Share Link"}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Mobile Master-Detail + Desktop Split) */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Side: Threads List (Mobile: hidden when active chat is open) */}
        <aside
          className={`${
            active ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-96 flex-col border-r-2 border-[#0a0a0a] bg-[#FAF9F6]`}
        >
          {/* Share Link Banner */}
          <div className="p-3 border-b-2 border-[#0a0a0a] bg-[#F5F3FF]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-[#7C3AED]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Your Public Confession Link</span>
              </div>
              <button
                onClick={() => setShowQRModal(true)}
                className="text-[10px] font-bold text-[#0a0a0a] underline sm:hidden"
              >
                View QR
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-xl border-2 border-[#0a0a0a] bg-white px-2.5 py-1.5 shadow-[0_2px_0_0_#0a0a0a]">
              <span className="font-mono text-xs font-bold text-[#0a0a0a] truncate">
                buzzofficial.vercel.app/c/{username || "..."}
              </span>
              <button
                onClick={copyGuestLink}
                className="ml-2 grid h-6 w-6 place-items-center rounded-md border border-[#0a0a0a] bg-[#EDE9FE] text-[#7C3AED]"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="p-2.5 border-b-2 border-[#0a0a0a] bg-white">
            <div className="flex items-center gap-2 rounded-xl border-2 border-[#0a0a0a] bg-[#FAF9F6] px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-[#5b5b55]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search confessions by nickname..."
                className="w-full bg-transparent text-xs font-semibold text-[#0a0a0a] outline-none placeholder:text-[#5b5b55]"
              />
            </div>
          </div>

          {/* Threads Scroll List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#EDE9FE]">
                  <Ghost className="h-5 w-5 text-[#7C3AED]" />
                </div>
                <p className="text-xs font-bold text-[#0a0a0a]">No confessions yet</p>
                <p className="mt-1 text-[11px] text-[#5b5b55]">
                  Share your link on WhatsApp Status or Instagram Bio to get anonymous thoughts & ghost voice notes!
                </p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = active === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 border-[#0a0a0a] p-3 text-left transition-all ${
                      isSelected
                        ? "bg-[#EDE9FE] shadow-[0_3px_0_0_#0a0a0a]"
                        : "bg-white hover:bg-[#F5F3FF] shadow-[0_1px_0_0_#0a0a0a]"
                    }`}
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#F5F3FF] text-base font-black shadow-[0_2px_0_0_#0a0a0a] flex-shrink-0">
                      👻
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-[#0a0a0a] truncate">{t.nickname}</p>
                        <span className="text-[10px] font-mono text-[#5b5b55]">
                          {new Date(t.last_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5b5b55] truncate mt-0.5">Secret anonymous reply</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Side: Message Window (Mobile: full width when active) */}
        <section
          className={`${
            !active ? "hidden md:flex" : "flex"
          } flex-1 flex-col bg-white overflow-hidden`}
        >
          {!activeThread ? (
            <div className="flex flex-1 items-center justify-center bz-grid-paper p-6 text-center">
              <div className="bz-card p-6 max-w-sm text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#EDE9FE] shadow-[0_3px_0_0_#0a0a0a]">
                  <Ghost className="h-6 w-6 text-[#7C3AED]" />
                </div>
                <h2 className="text-sm font-black text-[#0a0a0a]">Select a Confession Thread</h2>
                <p className="mt-1 text-xs text-[#5b5b55]">
                  Click any conversation on the left to read their message and reply anonymously.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="border-b-2 border-[#0a0a0a] bg-[#FAF9F6] px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setActive(null)}
                    className="md:hidden grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#EDE9FE] text-sm">
                    👻
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-[#0a0a0a]">{activeThread.nickname}</p>
                      <span className="rounded-full border border-[#0a0a0a] bg-[#EDE9FE] px-1.5 py-0.2 text-[9px] font-bold text-[#7C3AED]">
                        ANONYMOUS
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[#5b5b55]">Protected guest conversation</p>
                  </div>
                </div>
              </div>

              {/* Message History Bubble Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bz-grid-paper">
                {msgs.map((m) => {
                  const isGuest = m.from_guest;
                  return (
                    <div key={m.id} className={`flex ${isGuest ? "justify-start" : "justify-end"}`}>
                      <div className="max-w-[85%] sm:max-w-[70%]">
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs font-semibold border-2 border-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] ${
                            isGuest ? "bg-white text-[#0a0a0a]" : "bg-[#EDE9FE] text-[#0a0a0a]"
                          }`}
                        >
                          <MessageText text={m.text} />
                        </div>
                        <div
                          className={`mt-1 flex items-center gap-1.5 text-[9px] font-mono text-[#5b5b55] ${
                            isGuest ? "justify-start pl-1" : "justify-end pr-1"
                          }`}
                        >
                          <span>{isGuest ? `👻 ${activeThread.nickname}` : "You"}</span>
                          <span>•</span>
                          <span>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Bar */}
              <div className="border-t-2 border-[#0a0a0a] bg-[#FAF9F6] p-3 flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-1 items-center rounded-full border-2 border-[#0a0a0a] bg-white px-4 py-2 shadow-[0_2px_0_0_#0a0a0a]">
                  <input
                    value={text}
                    placeholder={`Reply to ${activeThread.nickname}...`}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && reply()}
                    className="w-full bg-transparent text-xs font-semibold text-[#0a0a0a] outline-none placeholder:text-[#5b5b55]"
                  />
                </div>
                <button
                  onClick={reply}
                  className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#7C3AED] text-white shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#6D28D9]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* QR Code Share Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xs rounded-3xl border-3 border-[#0a0a0a] bg-white p-5 text-center shadow-[0_8px_0_0_#0a0a0a]">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute right-3.5 top-3.5 grid h-7 w-7 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-[#FAF9F6] text-[#0a0a0a]"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#EDE9FE]">
              <Ghost className="h-5 w-5 text-[#7C3AED]" />
            </div>
            <h3 className="text-sm font-black text-[#0a0a0a]">Scan for Secret Chat</h3>
            <p className="mt-0.5 text-[11px] text-[#5b5b55]">Anyone can scan to message you anonymously</p>
            <div className="mt-4 flex justify-center">
              <div className="rounded-2xl border-2 border-[#0a0a0a] bg-white p-3 shadow-[0_3px_0_0_#0a0a0a]">
                <QRCodeSVG value={guestLink} size={150} level="H" />
              </div>
            </div>
            <p className="mt-2 font-mono text-[11px] font-bold text-[#0a0a0a]">@{username}</p>
            <button
              onClick={copyGuestLink}
              className="bz-btn bz-btn-yellow mt-4 w-full py-2 text-xs font-bold"
            >
              Copy Secret Link
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
