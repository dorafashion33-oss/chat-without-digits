import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Mic, Send, Square, Sparkles, Ghost, ShieldCheck, ArrowRight, Shuffle, Check } from "lucide-react";
import { disguiseVoice, GHOST_EFFECTS, MAX_VOICE_SECONDS, type GhostEffect } from "@/lib/ghostVoice";
import { MessageText } from "@/components/chat/GhostVoiceBubble";
import { supabase } from "@/integrations/supabase/client";
import buzzLogo from "@/assets/buzz-logo.jpeg";

type Msg = { id: string; from_guest: boolean; text: string; created_at: string };
type Session = { thread: string; token: string; owner: string };

const key = (u: string) => `buzz:guest:${u.toLowerCase()}`;
const nicknameKey = (u: string) => `buzz:guest-nickname:${u.toLowerCase()}`;

const RANDOM_NICKNAMES = [
  "Secret Admirer",
  "Late Night Thinker",
  "Silent Watcher",
  "Anonymous Bestie",
  "Mystery Soul",
  "Classroom Friend",
];

const PROMPT_IDEAS = [
  "Drop an honest confession...",
  "What is one thing I don't know about you?",
  "Rate my vibe 1-10 honestly 🔥",
  "Be honest, what was your first impression?",
  "Drop a secret confession here 🤫",
];

const savedNickname = (username: string) => {
  try {
    return localStorage.getItem(nicknameKey(username)) || "";
  } catch {
    return "";
  }
};

export default function GuestChat() {
  const { username = "" } = useParams();
  const [session, setSession] = useState<Session | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(key(username)) || "null");
    } catch {
      return null;
    }
  });
  const [nick, setNick] = useState(() => savedNickname(username) || RANDOM_NICKNAMES[0]);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const [recording, setRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [claimDismissed, setClaimDismissed] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const ownerReplied = msgs.some((m) => !m.from_guest);

  const shuffleNickname = () => {
    const next = RANDOM_NICKNAMES[(RANDOM_NICKNAMES.indexOf(nick) + 1) % RANDOM_NICKNAMES.length];
    setNick(next);
  };

  const shufflePrompt = () => {
    setPromptIdx((prev) => (prev + 1) % PROMPT_IDEAS.length);
  };

  const startRec = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setVoiceBlob(new Blob(chunks, { type: rec.mimeType }));
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
      setTimeout(() => rec.state === "recording" && rec.stop(), MAX_VOICE_SECONDS * 1000);
    } catch {
      setError("Mic permission required for Ghost Voice.");
    }
  };

  const sendVoice = async (effect: GhostEffect) => {
    if (!voiceBlob || !session) return;
    setBusy(true);
    try {
      const url = await disguiseVoice(voiceBlob, effect);
      const value = `[voice:${effect}]${url}`;
      setMsgs((m) => [
        ...m,
        { id: `tmp-${Date.now()}`, from_guest: true, text: value, created_at: new Date().toISOString() },
      ]);
      const { error: rpcErr } = await supabase.rpc("guest_send", {
        _thread: session.thread,
        _token: session.token,
        _text: value,
      });
      if (rpcErr) setError("Voice send failed, please retry.");
      setVoiceBlob(null);
    } catch {
      setError("Voice process error.");
    }
    setBusy(false);
  };

  const startSession = async () => {
    if (!nick.trim()) {
      setError("Choose a nickname first!");
      return;
    }
    setBusy(true);
    setError("");
    const cleanNick = nick.trim();
    try {
      localStorage.setItem(nicknameKey(username), cleanNick);
    } catch {}

    const { data, error: rpcError } = await supabase.rpc("guest_start", {
      _username: username.toLowerCase(),
      _nickname: cleanNick,
    });
    setBusy(false);
    if (rpcError || !data || !(data as any).thread_id) {
      setError(rpcError?.message || "User not found or link expired.");
      return;
    }
    const res = data as unknown as { thread_id: string; guest_token: string; owner_name: string };
    const s: Session = { thread: res.thread_id, token: res.guest_token, owner: res.owner_name };
    setSession(s);
    try {
      localStorage.setItem(key(username), JSON.stringify(s));
    } catch {}

    // Agar initial text tha toh turant bhej do
    if (text.trim()) {
      const val = text.trim();
      setText("");
      setMsgs([{ id: `tmp-${Date.now()}`, from_guest: true, text: val, created_at: new Date().toISOString() }]);
      await supabase.rpc("guest_send", {
        _thread: res.thread_id,
        _token: res.guest_token,
        _text: val,
      });
    }
  };

  const loadMsgs = async () => {
    if (!session) return;
    const { data } = await supabase.rpc("guest_fetch", {
      _thread: session.thread,
      _token: session.token,
    });
    if (data) setMsgs(data as Msg[]);
  };

  useEffect(() => {
    if (!session) return;
    loadMsgs();
    const iv = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadMsgs();
      }
    }, 5000);
    return () => clearInterval(iv);
  }, [session]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const val = text.trim();
    if (!val || !session || busy) return;
    setText("");
    setMsgs((m) => [
      ...m,
      { id: `tmp-${Date.now()}`, from_guest: true, text: val, created_at: new Date().toISOString() },
    ]);
    const { error: rpcErr } = await supabase.rpc("guest_send", {
      _thread: session.thread,
      _token: session.token,
      _text: val,
    });
    if (rpcErr) setError("Message failed to deliver.");
  };

  // STEP 1: VIRAL NGL CONFESSION BOOTH
   if (!session) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-[#FAF9F6] p-4">
        <div className="relative overflow-hidden w-full max-w-sm rounded-3xl border-3 border-[#0a0a0a] bg-white p-5 shadow-[0_8px_0_0_#0a0a0a]">
          {/* 🇮🇳 Tiranga Top Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] animate-pulse" />
          {/* Top Brand Sticker */}
          <div className="rounded-2xl border-2 border-[#0a0a0a] bg-gradient-to-tr from-[#7C3AED] via-[#C026D3] to-[#F59E0B] p-4 text-white shadow-[0_3px_0_0_#0a0a0a]">
            <div className="flex items-center justify-between text-xs font-bold text-white/90">
              <span className="flex items-center gap-1.5">
                <Ghost className="h-4 w-4" /> Send Confession to
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase backdrop-blur-xs">
                100% Anonymous
              </span>
            </div>
            <h1 className="mt-1 text-base font-black tracking-tight text-white drop-shadow-sm">
              @{username}
            </h1>
            <p className="mt-1 text-xs text-white/90">
              They will never know who sent this. Honest confessions only! 🤫
            </p>
          </div>

          {/* Confession Box */}
          <div className="mt-4 space-y-3">
            <div className="relative rounded-2xl border-2 border-[#0a0a0a] bg-[#FAF9F6] p-3 shadow-[0_2px_0_0_#0a0a0a]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#5b5b55] mb-1.5">
                <span>Your Secret Message:</span>
                <button
                  type="button"
                  onClick={shufflePrompt}
                  className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700 hover:underline"
                >
                  <Shuffle className="h-3 w-3" /> Idea
                </button>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={PROMPT_IDEAS[promptIdx]}
                maxLength={1000}
                rows={4}
                className="w-full resize-none bg-transparent text-xs font-semibold text-[#0a0a0a] outline-none placeholder:text-[#5b5b55]/60"
                autoFocus
              />

              <div className="text-right text-[10px] font-mono font-bold text-[#5b5b55]">
                {text.length}/1000
              </div>
            </div>

            {/* Disguised Nickname Picker */}
            <div className="rounded-2xl border-2 border-[#0a0a0a] bg-white p-3 shadow-[0_2px_0_0_#0a0a0a]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#5b5b55] mb-1.5">
                <span>Disguised Sender Tag:</span>
                <button
                  type="button"
                  onClick={shuffleNickname}
                  className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700 hover:underline"
                >
                  <Shuffle className="h-3 w-3" /> Change
                </button>
              </div>
              <input
                type="text"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                maxLength={30}
                placeholder="Choose sender name..."
                className="w-full bg-[#FAF9F6] rounded-xl border border-[#0a0a0a] px-3 py-1.5 text-xs font-bold text-[#0a0a0a] outline-none"
              />
            </div>

            {error && (
              <div className="rounded-xl border-2 border-red-600 bg-red-100 p-2 text-xs font-bold text-red-900">
                {error}
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={startSession}
              disabled={busy || !nick.trim()}
              className="w-full rounded-2xl border-2 border-[#0a0a0a] bg-[#FCE314] py-3.5 text-xs font-black uppercase tracking-wider text-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a] hover:translate-y-0.5 disabled:opacity-50"
            >
              {busy ? "Sending Anonymously..." : "Send Confession 🚀"}
            </button>
          </div>

          {/* Privacy Guarantee */}
          <div className="mt-4 pt-3 border-t-2 border-[#0a0a0a]/10 text-center">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5b5b55]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> End-to-end secret · No account or phone number required
            </span>
          </div>
        </div>
      </main>
    );
  }

  // STEP 2: ACTIVE CONVERSATION ARENA
  return (
    <main className="flex h-dvh flex-col bg-white">
      {/* Header */}
      <header className="border-b-2 border-[#0a0a0a] bg-gradient-to-r from-purple-100 to-pink-50 px-4 py-2.5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-gradient-to-tr from-purple-600 to-pink-500 text-white text-sm">
            👻
          </div>
          <div>
            <p className="text-xs font-black text-[#0a0a0a]">{session.owner}</p>
            <p className="text-[10px] font-mono font-bold text-[#5b5b55]">
              @{username} · You are "{nick}"
            </p>
          </div>
        </div>
        <a
          href={`/auth?mode=signup&username=${encodeURIComponent(nick.trim() || "Guest")}`}
          className="rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] px-3 py-1.5 text-[11px] font-black text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
        >
          Get My Link
        </a>
      </header>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F6]">
        {msgs.length === 0 && (
          <div className="pt-8 text-center">
            <span className="inline-block rounded-2xl border-2 border-[#0a0a0a] bg-white p-4 shadow-[0_3px_0_0_#0a0a0a] text-xs font-bold text-[#0a0a0a]">
              Confession sent! Wait for @{username} to reply here 👻
            </span>
          </div>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from_guest ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-semibold border-2 border-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] ${
                m.from_guest
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-xs border-purple-900"
                  : "bg-white text-[#0a0a0a] rounded-bl-xs"
              }`}
            >
              <MessageText text={m.text} />
              <div className={`mt-1 text-right text-[9px] ${m.from_guest ? "text-white/70" : "text-[#5b5b55]"}`}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {error && <p className="px-4 py-1 text-xs font-bold text-red-600 bg-red-100">{error}</p>}

      {/* Owner replied callout */}
      {ownerReplied && !claimDismissed && (
        <div className="mx-3 mb-2 rounded-2xl border-2 border-[#0a0a0a] bg-purple-100 p-3 text-center shadow-[0_3px_0_0_#0a0a0a]">
          <p className="font-black text-[#0a0a0a] text-xs">@{username} replied to your confession! 🔥</p>
          <div className="mt-2 flex gap-2 justify-center">
            <button
              onClick={() => setClaimDismissed(true)}
              className="rounded-xl border border-[#0a0a0a] bg-white px-3 py-1 text-[11px] font-bold"
            >
              Later
            </button>
            <a
              href={`/auth?mode=signup&username=${encodeURIComponent(nick.trim() || "Guest")}`}
              className="rounded-xl border border-[#0a0a0a] bg-[#FCE314] px-4 py-1 text-[11px] font-black text-[#0a0a0a]"
            >
              Claim your Buzz ID
            </a>
          </div>
        </div>
      )}

      {/* Voice effect selection drawer */}
      {voiceBlob && (
        <div className="border-t-2 border-[#0a0a0a] bg-white p-3 space-y-2">
          <p className="text-xs font-black text-[#0a0a0a] flex items-center gap-1.5">
            <Ghost className="h-4 w-4 text-purple-600" /> Pick Ghost Voice filter:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {GHOST_EFFECTS.map((e) => (
              <button
                key={e.id}
                disabled={busy}
                onClick={() => sendVoice(e.id)}
                className="rounded-xl border-2 border-[#0a0a0a] bg-[#FAF9F6] py-2 text-xs font-bold shadow-[0_2px_0_0_#0a0a0a] hover:bg-purple-100"
              >
                {e.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setVoiceBlob(null)}
            className="w-full text-center text-xs font-bold text-[#5b5b55] py-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Bottom Input */}
      <div className="border-t-2 border-[#0a0a0a] bg-white p-3 flex items-center gap-2">
        <button
          onClick={() => (recording ? recRef.current?.stop() : startRec())}
          className={`grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] ${
            recording ? "bg-red-500 text-white animate-pulse" : "bg-[#FAF9F6] text-[#0a0a0a] hover:bg-purple-100"
          }`}
          title="Ghost Voice"
        >
          {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <div className="flex flex-1 items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FAF9F6] px-4 py-2 shadow-[0_2px_0_0_#0a0a0a]">
          <input
            value={text}
            maxLength={2000}
            placeholder="Type your confession..."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="w-full bg-transparent text-xs font-semibold text-[#0a0a0a] outline-none placeholder:text-[#5b5b55]"
          />
        </div>

        <button
          onClick={send}
          disabled={!text.trim()}
          className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-[0_2px_0_0_#0a0a0a] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
