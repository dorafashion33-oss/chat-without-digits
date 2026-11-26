import { useEffect, useRef, useState } from "react";
import { 
  ArrowLeft, Copy, Send, Ghost, QrCode, Search, Check, 
  Sparkles, X, Share2, Shuffle, MessageCircle, ShieldCheck, Heart 
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageText } from "@/components/chat/GhostVoiceBubble";

type Thread = { id: string; nickname: string; last_at: string };
type Msg = { id: string; thread_id: string; from_guest: boolean; text: string; created_at: string };

const VIRAL_PROMPTS = [
  "Send me anonymous confessions & secret thoughts 💭",
  "Be honest, what was your first impression of me? 👀",
  "Drop one secret you never had the guts to tell me 🤫",
  "Rate my vibe from 1 to 10 honestly 🔥",
  "Ask me anything, I promise to answer on my status! 💬",
  "What is one thing I should change about myself? 🤔",
];

const MYSTERY_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  "Secret Admirer": { label: "❤️ Admirer", bg: "bg-rose-100", text: "text-rose-700" },
  "Late Night Thinker": { label: "🌙 Midnight", bg: "bg-indigo-100", text: "text-indigo-700" },
  "Silent Watcher": { label: "👀 Watcher", bg: "bg-amber-100", text: "text-amber-700" },
  "Anonymous Bestie": { label: "✨ Bestie", bg: "bg-purple-100", text: "text-purple-700" },
};

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
  const [promptIdx, setPromptIdx] = useState(0);

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
  const currentPrompt = VIRAL_PROMPTS[promptIdx];

  const shufflePrompt = () => {
    setPromptIdx((prev) => (prev + 1) % VIRAL_PROMPTS.length);
  };

  const copyGuestLink = () => {
    navigator.clipboard.writeText(guestLink);
    setCopied(true);
    toast.success("Confession link copied! Paste on WhatsApp Status or Insta Bio 🔥");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const shareText = `${currentPrompt}\n\n👉 Send me an anonymous confession here:\n${guestLink}\n\n(Zero login needed · 100% anonymous)`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");
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
      <main className="flex h-screen items-center justify-center bg-[#FAF9F6] p-4">
        <div className="w-full max-w-sm rounded-3xl border-3 border-[#0a0a0a] bg-white p-7 text-center shadow-[0_8px_0_0_#0a0a0a]">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white shadow-md">
            <Ghost className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black text-[#0a0a0a]">Log in to read Confessions</h2>
          <p className="mt-1.5 text-xs font-medium text-[#5b5b55] leading-relaxed">
            See anonymous confessions, thoughts & secret ghost voice notes sent to your profile.
          </p>
          <a 
            href="/auth" 
            className="mt-5 block w-full rounded-2xl border-2 border-[#0a0a0a] bg-[#FCE314] py-3 text-xs font-black uppercase tracking-wider text-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a] hover:translate-y-0.5"
          >
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
      <header className="border-b-2 border-[#0a0a0a] bg-white px-4 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="grid h-8 w-8 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FAF9F6] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-[#0a0a0a] tracking-tight">Confessions Inbox</h1>
              <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-2 py-0.5 text-[9px] font-black text-white shadow-xs">
                NGL STYLE
              </span>
            </div>
            <p className="text-[10px] font-medium text-[#5b5b55]">Anonymous replies & Ghost Voice notes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0a0a0a] bg-[#FAF9F6] px-3 py-1.5 text-xs font-bold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-white"
          >
            <QrCode className="h-3.5 w-3.5 text-purple-600" /> Card QR
          </button>
          <button
            onClick={shareToWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0a0a0a] bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white shadow-[0_2px_0_0_#0a0a0a] hover:brightness-105"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share to Status</span>
            <span className="sm:hidden">Share</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Mobile Master-Detail + Desktop Split) */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Side: Story Sticker Card + Confession Threads */}
        <aside
          className={`${
            active ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-96 flex-col border-r-2 border-[#0a0a0a] bg-[#FAF9F6]`}
        >
          {/* NGL Story Sticker Card */}
          <div className="p-3.5 border-b-2 border-[#0a0a0a] bg-gradient-to-b from-purple-50/80 to-white">
            <div className="rounded-2xl border-2 border-[#0a0a0a] bg-gradient-to-tr from-[#7C3AED] via-[#C026D3] to-[#F59E0B] p-4 text-white shadow-[0_4px_0_0_#0a0a0a] relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] font-bold text-white/90 mb-1">
                <span className="flex items-center gap-1">
                  <Ghost className="h-3.5 w-3.5" /> @{username || "you"}
                </span>
                <button 
                  onClick={shufflePrompt}
                  className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-xs hover:bg-white/30"
                  title="Shuffle question"
                >
                  <Shuffle className="h-3 w-3" /> Shuffle
                </button>
              </div>

              <p className="text-sm font-extrabold tracking-tight text-white mt-1 leading-snug drop-shadow-sm">
                "{currentPrompt}"
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={copyGuestLink}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#0a0a0a] bg-white py-1.5 text-xs font-black text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FAF9F6]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
                <button
                  onClick={shareToWhatsApp}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-[#0a0a0a] bg-[#25D366] px-3 py-1.5 text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a] hover:brightness-105"
                  title="Share to WhatsApp Status"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
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
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-purple-100 text-purple-600 border-2 border-[#0a0a0a]">
                  <Ghost className="h-6 w-6" />
                </div>
                <p className="text-xs font-black text-[#0a0a0a]">No confessions yet</p>
                <p className="mt-1 text-[11px] text-[#5b5b55] leading-relaxed">
                  Post your link to WhatsApp Status or Instagram Bio to receive secret thoughts & ghost voices!
                </p>
                <button
                  onClick={shareToWhatsApp}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0a0a0a] bg-[#25D366] px-4 py-2 text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a]"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share on Status
                </button>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = active === t.id;
                const badge = MYSTERY_BADGES[t.nickname] || { label: "🤫 Secret", bg: "bg-purple-100", text: "text-purple-700" };
                return (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 border-[#0a0a0a] p-3 text-left transition-all ${
                      isSelected
                        ? "bg-[#EDE9FE] shadow-[0_3px_0_0_#0a0a0a] -translate-y-0.5"
                        : "bg-white hover:bg-[#FAF9F6] shadow-[0_1.5px_0_0_#0a0a0a]"
                    }`}
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-gradient-to-tr from-purple-500 to-pink-500 text-base text-white shadow-[0_2px_0_0_#0a0a0a] flex-shrink-0">
                      👻
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-[#0a0a0a] truncate">{t.nickname}</p>
                        <span className="text-[10px] font-mono font-medium text-[#5b5b55]">
                          {new Date(t.last_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-extrabold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-purple-600 font-bold">Tap to read →</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Side: Message Window */}
        <section
          className={`${
            !active ? "hidden md:flex" : "flex"
          } flex-1 flex-col bg-white overflow-hidden`}
        >
          {!activeThread ? (
            <div className="flex flex-1 items-center justify-center bg-[#FAF9F6] p-6 text-center">
              <div className="w-full max-w-sm rounded-3xl border-3 border-[#0a0a0a] bg-white p-7 text-center shadow-[0_6px_0_0_#0a0a0a]">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-sm">
                  <Ghost className="h-6 w-6" />
                </div>
                <h2 className="text-sm font-black text-[#0a0a0a]">Pick a Confession to Read</h2>
                <p className="mt-1.5 text-xs text-[#5b5b55] leading-relaxed">
                  Select any anonymous sender on the left to read their message, hear ghost voices, and reply back.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="border-b-2 border-[#0a0a0a] bg-[#FAF9F6] px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActive(null)}
                    className="md:hidden grid h-8 w-8 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-gradient-to-tr from-purple-500 to-pink-500 text-sm text-white">
                    👻
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-[#0a0a0a]">{activeThread.nickname}</p>
                      <span className="rounded-full bg-purple-100 px-1.5 py-0.2 text-[9px] font-black text-purple-700">
                        ANONYMOUS
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-[#5b5b55] flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" /> Identity 100% Protected
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F6]/50">
                {msgs.map((m) => {
                  const isGuest = m.from_guest;
                  return (
                    <div key={m.id} className={`flex ${isGuest ? "justify-start" : "justify-end"}`}>
                      <div className="max-w-[85%] sm:max-w-[70%]">
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs font-semibold border-2 border-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] ${
                            isGuest 
                              ? "bg-white text-[#0a0a0a] rounded-bl-xs" 
                              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-xs border-purple-900"
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
              <div className="border-t-2 border-[#0a0a0a] bg-white p-3 flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-1 items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FAF9F6] px-4 py-2 shadow-[0_2px_0_0_#0a0a0a]">
                  <input
                    value={text}
                    placeholder={`Reply anonymously to ${activeThread.nickname}...`}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && reply()}
                    className="w-full bg-transparent text-xs font-semibold text-[#0a0a0a] outline-none placeholder:text-[#5b5b55]"
                  />
                </div>
                <button
                  onClick={reply}
                  disabled={!text.trim()}
                  className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-[0_2px_0_0_#0a0a0a] hover:brightness-110 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* QR Code Story Sticker Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xs rounded-3xl border-3 border-[#0a0a0a] bg-white p-5 text-center shadow-[0_8px_0_0_#0a0a0a]">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute right-3.5 top-3.5 grid h-7 w-7 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FAF9F6] text-[#0a0a0a]"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white shadow-sm">
              <Ghost className="h-6 w-6" />
            </div>

            <h3 className="text-sm font-black text-[#0a0a0a]">Secret Confession Card</h3>
            <p className="mt-0.5 text-[11px] text-[#5b5b55]">Post this QR to your Status or Story!</p>

            <div className="mt-4 flex justify-center">
              <div className="rounded-2xl border-2 border-[#0a0a0a] bg-white p-3.5 shadow-[0_3px_0_0_#0a0a0a]">
                <QRCodeSVG value={guestLink} size={150} level="H" />
              </div>
            </div>

            <p className="mt-2.5 font-mono text-xs font-black text-[#0a0a0a]">@{username}</p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={shareToWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0a0a0a] bg-[#25D366] py-2 text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a]"
              >
                <Share2 className="h-3.5 w-3.5" /> Share to WhatsApp Status
              </button>
              <button
                onClick={copyGuestLink}
                className="w-full rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] py-2 text-xs font-black text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
              >
                Copy Story Link
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
