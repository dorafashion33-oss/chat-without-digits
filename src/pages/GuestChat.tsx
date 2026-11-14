import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Mic, Send, Square, Sparkles, Ghost, ShieldCheck, ArrowRight } from "lucide-react";
import { disguiseVoice, GHOST_EFFECTS, MAX_VOICE_SECONDS, type GhostEffect } from "@/lib/ghostVoice";
import { MessageText } from "@/components/chat/GhostVoiceBubble";
import { supabase } from "@/integrations/supabase/client";
import buzzLogo from "@/assets/buzz-logo.jpeg";

type Msg = { id: string; from_guest: boolean; text: string; created_at: string };
type Session = { thread: string; token: string; owner: string };

const key = (u: string) => `buzz:guest:${u.toLowerCase()}`;
const nicknameKey = (u: string) => `buzz:guest-nickname:${u.toLowerCase()}`;

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
  const [nick, setNick] = useState(() => savedNickname(username));
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const [recording, setRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [claimDismissed, setClaimDismissed] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const ownerReplied = msgs.some((m) => !m.from_guest);

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
    const res = data as { thread_id: string; guest_token: string; owner_name: string };
    const s: Session = { thread: res.thread_id, token: res.guest_token, owner: res.owner_name };
    setSession(s);
    try {
      localStorage.setItem(key(username), JSON.stringify(s));
    } catch {}
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
    const iv = setInterval(loadMsgs, 3500);
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

  // STEP 1: NICKNAME ENTRY SCREEN
  if (!session) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bz-grid-paper p-5">
        <div className="w-full max-w-sm rounded-3xl border-4 border-[#0a0a0a] bg-white p-7 shadow-[0_10px_0_0_#0a0a0a]">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={buzzLogo}
              alt="Buzz"
              className="h-16 w-16 rounded-2xl border-2 border-[#0a0a0a] object-cover shadow-[0_4px_0_0_#0a0a0a]"
            />
            <div className="mt-4 inline-block rounded-lg border-2 border-[#0a0a0a] bg-[#E2ECFF] px-3 py-1 font-mono text-[11px] font-bold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]">
              ANONYMOUS GUEST CHAT
            </div>
            <h1 className="mt-3 text-xl font-black text-[#0a0a0a]">
              Send a secret message to <span className="bz-squig">@{username}</span>
            </h1>
            <p className="mt-2 text-xs font-medium text-[#5b5b55] leading-relaxed">
              No app download or password needed. Choose a nickname to start chatting anonymously with Ghost Voice.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] px-3.5 py-3 shadow-[0_2px_0_0_#0a0a0a]">
              <input
                type="text"
                placeholder="Choose a nickname (e.g. Secret Friend)"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                maxLength={30}
                className="w-full bg-transparent text-sm font-bold text-[#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
                onKeyDown={(e) => e.key === "Enter" && startSession()}
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-xl border-2 border-red-600 bg-red-100 p-2 text-xs font-bold text-red-900">
                {error}
              </div>
            )}

            <button
              onClick={startSession}
              disabled={busy || !nick.trim()}
              className="bz-btn bz-btn-yellow w-full py-3.5 text-sm font-black uppercase tracking-wider"
            >
              {busy ? "Starting..." : "Start Chatting"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-[#0a0a0a]/15 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5b5b55]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" /> 100% Anonymous & Zero Trace
            </span>
          </div>
        </div>
      </main>
    );
  }

  // STEP 2: ACTIVE GUEST CHAT WINDOW
  return (
    <main className="flex h-dvh flex-col bg-white">
      {/* Neo-Brutalist Top Header */}
      <header className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-[#0a0a0a]">{session.owner}</p>
          <p className="text-[11px] font-mono font-bold text-[#5b5b55]">
            @{username} · Anonymous Guest Chat
          </p>
        </div>
        <a
          href={`/auth?mode=signup&username=${encodeURIComponent(nick.trim() || "Guest")}`}
          className="bz-btn bz-btn-ink px-3 py-1.5 text-xs font-bold"
        >
          Claim @handle
        </a>
      </header>

      {/* Conversion Banner */}
      <div className="border-b-2 border-[#0a0a0a] bg-[#DCF4E4] px-4 py-2 text-center text-xs font-bold text-[#0a0a0a]">
        Want to save this chat forever?{" "}
        <a
          href={`/auth?mode=signup&username=${encodeURIComponent(nick.trim() || "Guest")}`}
          className="underline underline-offset-2 hover:text-black"
        >
          Claim your own @username on Buzz →
        </a>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bz-grid-paper">
        {msgs.length === 0 && (
          <div className="pt-12 text-center">
            <span className="inline-block rounded-xl border-2 border-[#0a0a0a] bg-white p-4 shadow-[0_4px_0_0_#0a0a0a] text-xs font-bold text-[#0a0a0a]">
              Say hi or send a Ghost Voice note to @{username} 👻
            </span>
          </div>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from_guest ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-semibold border-2 border-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a] ${
                m.from_guest
                  ? "bg-[#FCE314] text-[#0a0a0a] rounded-br-xs"
                  : "bg-white text-[#0a0a0a] rounded-bl-xs"
              }`}
            >
              <MessageText text={m.text} />
              <div className="mt-1 text-right text-[9px] text-[#0a0a0a]/60">
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
        <div className="mx-3 mb-2 rounded-2xl border-3 border-[#0a0a0a] bg-[#EEE5FF] p-4 text-center shadow-[0_5px_0_0_#0a0a0a]">
          <p className="font-black text-[#0a0a0a] text-sm">@{username} replied to your message! 🔥</p>
          <p className="mt-1 text-xs font-medium text-[#4b306b]">
            Save this conversation forever — claim your own unique @username in 5 seconds.
          </p>
          <div className="mt-3 flex gap-2 justify-center">
            <button
              onClick={() => setClaimDismissed(true)}
              className="bz-btn bz-btn-white px-4 py-1.5 text-xs font-bold"
            >
              Later
            </button>
            <a
              href={`/auth?mode=signup&username=${encodeURIComponent(nick.trim() || "Guest")}`}
              className="bz-btn bz-btn-yellow px-5 py-1.5 text-xs font-black"
            >
              Claim @{nick}
            </a>
          </div>
        </div>
      )}

      {/* Voice effect selection drawer */}
      {voiceBlob && (
        <div className="border-t-2 border-[#0a0a0a] bg-[#fffbec] p-3 space-y-2">
          <p className="text-xs font-black text-[#0a0a0a] flex items-center gap-1.5">
            <Ghost className="h-4 w-4" /> Pick a Ghost Voice filter:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {GHOST_EFFECTS.map((e) => (
              <button
                key={e.id}
                disabled={busy}
                onClick={() => sendVoice(e.id)}
                className="bz-btn bz-btn-white py-2 text-xs font-bold"
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
      <div className="border-t-2 border-[#0a0a0a] bg-[#fffbec] p-3 flex items-center gap-2">
        <button
          onClick={() => (recording ? recRef.current?.stop() : startRec())}
          className={`grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] ${
            recording ? "bg-red-500 text-white animate-pulse" : "bg-white text-[#0a0a0a] hover:bg-[#FFF6B8]"
          }`}
          title="Ghost Voice"
        >
          {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <div className="flex flex-1 items-center rounded-full border-2 border-[#0a0a0a] bg-white px-4 py-2 shadow-[0_2px_0_0_#0a0a0a]">
          <input
            value={text}
            maxLength={2000}
            placeholder="Type an anonymous message..."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="w-full bg-transparent text-xs font-semibold text-[#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
          />
        </div>

        <button
          onClick={send}
          disabled={!text.trim()}
          className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
