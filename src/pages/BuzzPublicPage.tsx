import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  Globe,
  KeyRound,
  Lock,
  LockKeyhole,
  MessageCircle,
  Mic,
  Phone,
  Play,
  QrCode,
  Send,
  Shield,
  ShieldCheck,
  Smile,
  Smartphone,
  Sparkles,
  Users,
  Video,
  Volume2,
  Zap,
} from "lucide-react";
import InstallAppDialog from "@/components/chat/InstallAppDialog";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import { QRCodeSVG } from "qrcode.react";

export type PublicPage = "features" | "privacy" | "buzz-web" | "download" | "guest-chat" | "contact";
export const publicPages: PublicPage[] = ["features", "privacy", "buzz-web", "download", "guest-chat", "contact"];

/* ═══════════════════════════════════════════════════════════════════
   1. REAL-TIME BUZZ CHAT SIMULATOR (100% AUTHENTIC BUZZ DESIGN)
   ═══════════════════════════════════════════════════════════════════ */
export function BuzzRealtimeChatSimulator() {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: "partner" | "me";
      text: string;
      time: string;
      isGhostVoice?: boolean;
      voiceEffect?: string;
    }>
  >([
    {
      id: "1",
      sender: "partner",
      text: "Hey! Did you see the new Guest Chat link feature on Buzz? 🚀",
      time: "10:14 AM",
    },
    {
      id: "2",
      sender: "me",
      text: "Yes! Put my @rahul link in my Instagram bio. Already received 6 secret confessions 😂",
      time: "10:15 AM",
    },
    {
      id: "3",
      sender: "partner",
      text: "Listen to this Ghost Voice note I sent you with Chipmunk filter! 🐿️",
      time: "10:16 AM",
      isGhostVoice: true,
      voiceEffect: "Chipmunk Effect",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // Audio synthesizer using Web Audio API (0 external cost, 100% in-browser)
  const playSampleVoice = (effect: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      setIsPlayingAudio(true);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = effect.includes("Chipmunk") ? 600 : effect.includes("Demon") ? 120 : 350;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);

      setTimeout(() => setIsPlayingAudio(false), 1200);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: "me" as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate partner typing and contextual live reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      let reply = "That's awesome! Buzz's zero phone number privacy is unmatched 🛡️";
      const lower = text.toLowerCase();
      if (lower.includes("voice") || lower.includes("ghost") || lower.includes("audio")) {
        reply = "Ghost Voice notes are processed directly in your browser. 0 phone data, 100% private! 🎤";
      } else if (lower.includes("guest") || lower.includes("link") || lower.includes("confession")) {
        reply = "Anyone can send a guest message to your link without creating an account! Check /guests inbox 🤫";
      } else if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
        reply = "Hey there! Ready to chat without sharing your phone number? 🇮🇳";
      } else if (lower.includes("call") || lower.includes("video")) {
        reply = "Buzz calls are peer-to-peer WebRTC! Clear HD voice with zero middleman recording 📞";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "partner",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1200);
  };

  return (
    <div className="bz-card overflow-hidden p-0 shadow-[0_8px_0_0_#0a0a0a] bg-white border-2 border-[#0a0a0a]">
      {/* Neo-Brutalist Chat Header */}
      <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#fffbec] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] gradient-brand text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a]">
              PS
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[#0a0a0a] bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-[#0a0a0a]">@priya_sharma</h3>
              <span className="text-[11px]" title="Made in India">🇮🇳</span>
            </div>
            <p className="text-[10px] font-mono font-bold text-emerald-800">● ONLINE</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a] text-[#0a0a0a]">
            <Phone className="h-4 w-4" />
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a] text-[#0a0a0a]">
            <Video className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Messages Shell */}
      <div ref={scrollRef} className="h-80 overflow-y-auto bz-grid-paper p-4 space-y-3 text-xs">
        <div className="flex justify-center mb-2">
          <span className="inline-block rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 font-mono text-[10px] font-black text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]">
            🔒 END-TO-END ENCRYPTED CONVERSATION
          </span>
        </div>

        {messages.map((m) => {
          const isOwn = m.sender === "me";
          return (
            <div key={m.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl border-2 border-[#0a0a0a] p-3 text-xs font-medium shadow-[0_3px_0_0_#0a0a0a] ${
                  isOwn ? "bg-[#FFF6B8] text-[#0a0a0a]" : "bg-white text-[#0a0a0a]"
                }`}
              >
                {m.isGhostVoice ? (
                  <div className="space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <Mic className="h-4 w-4 text-purple-600" />
                      <span>Ghost Voice Note</span>
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-mono text-purple-900 border border-[#0a0a0a]/20">
                        {m.voiceEffect}
                      </span>
                    </p>
                    <button
                      onClick={() => playSampleVoice(m.voiceEffect || "")}
                      className="flex items-center gap-2 rounded-lg border-2 border-[#0a0a0a] bg-white px-3 py-1.5 text-xs font-black shadow-[0_1px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                    >
                      <Play className={`h-3.5 w-3.5 ${isPlayingAudio ? "text-purple-600 animate-spin" : ""}`} />
                      <span>{isPlayingAudio ? "Playing 0:08..." : "Play Voice (Audio)"}</span>
                    </button>
                  </div>
                ) : (
                  <p className="leading-relaxed">{m.text}</p>
                )}

                <div className="mt-1 flex items-center justify-end gap-1 font-mono text-[9px] font-bold text-[#5b5b55]">
                  <span>{m.time}</span>
                  {isOwn && <CheckCheck className="inline h-3 w-3 text-blue-600 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-1.5 bg-white border-2 border-[#0a0a0a] px-3 py-1.5 rounded-full w-fit shadow-[0_2px_0_0_#0a0a0a]">
            <span className="text-[10px] font-bold text-[#5b5b55]">Priya is typing</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#0a0a0a] animate-bounce" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#0a0a0a] animate-bounce [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#0a0a0a] animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      {/* Quick Test Prompt Chips */}
      <div className="flex gap-1.5 overflow-x-auto border-t-2 border-[#0a0a0a] bg-[#fffbec] px-3 py-2">
        <button
          onClick={() => handleSend("Tell me about Ghost Voice filters 🎤")}
          className="whitespace-nowrap rounded-lg border border-[#0a0a0a] bg-white px-2 py-1 text-[10px] font-black hover:bg-[#FFF6B8]"
        >
          🎤 Ghost Voice?
        </button>
        <button
          onClick={() => handleSend("How does Guest Chat work? 🤫")}
          className="whitespace-nowrap rounded-lg border border-[#0a0a0a] bg-white px-2 py-1 text-[10px] font-black hover:bg-[#FFF6B8]"
        >
          🤫 Guest Chat?
        </button>
        <button
          onClick={() => handleSend("Are phone numbers 100% hidden? 🛡️")}
          className="whitespace-nowrap rounded-lg border border-[#0a0a0a] bg-white px-2 py-1 text-[10px] font-black hover:bg-[#FFF6B8]"
        >
          🛡️ No Numbers?
        </button>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t-2 border-[#0a0a0a] bg-white p-3"
      >
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a real message to Priya..."
          className="flex-1 rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] px-3 py-2 text-xs font-bold text-[#0a0a0a] outline-none"
        />
        <button
          type="button"
          onClick={() => playSampleVoice("Chipmunk")}
          className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
          title="Send Sample Ghost Voice"
        >
          <Mic className="h-4 w-4 text-[#0a0a0a]" />
        </button>
        <button
          type="submit"
          className="bz-btn bz-btn-yellow h-9 px-3.5 text-xs font-black shadow-[0_2px_0_0_#0a0a0a]"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

/* FAQ Accordion Component */
const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bz-card p-4 transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-sm font-black text-[#0a0a0a]"
      >
        <span>{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed pt-2 border-t border-[#0a0a0a]/10">{a}</p>}
    </div>
  );
};

export default function BuzzPublicPage({
  page,
  onLogin,
}: {
  page: PublicPage;
  onLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  /* ═══════════════════════════════════════════════════════════════════
     PAGE 1: FEATURES (LONG WHATSAPP-STYLE SPECIFICATION)
     ═══════════════════════════════════════════════════════════════════ */
  if (page === "features") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20 space-y-20">
        {/* Hero */}
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a] mb-4">
              <Zap className="h-3.5 w-3.5" /> 100+ CAPABILITIES UNLOCKED
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-[#0a0a0a] leading-[1.05] tracking-tight">
              Every tool you love.<br />
              <span className="bz-squig">Zero phone numbers.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#5b5b55] font-medium leading-relaxed">
              Buzz reimagines modern communication from first principles. Everything from instantaneous direct messaging, 4K media sharing, and low-latency WebRTC calls to Anonymous Guest links and Ghost Voice notes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={onLogin} className="bz-btn bz-btn-yellow px-6 py-3.5 text-sm font-black">
                Claim Free @username <ArrowRight className="h-4 w-4" />
              </button>
              <Link to="/guest-chat" className="bz-btn bz-btn-white px-5 py-3.5 text-sm font-bold">
                Explore Guest Chat 🤫
              </Link>
            </div>
          </div>
          <BuzzRealtimeChatSimulator />
        </div>

        {/* 6 Feature Pillars */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="bz-label">BUZZ FEATURE ARCHITECTURE</span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0a0a0a]">
              Built for Speed, Privacy, and Independence
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
              <div className="h-10 w-10 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FFF6B8] mb-3 text-xl font-black">
                🛡️
              </div>
              <h3 className="text-base font-black text-[#0a0a0a] mb-2">Zero Phone Identity</h3>
              <p className="text-xs text-[#5b5b55] leading-relaxed">
                Connect solely via your custom @handle. No SIM-swaps, no phone spam, and no risk of your bank account being mapped to your chat app.
              </p>
            </div>

            <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
              <div className="h-10 w-10 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] mb-3 text-xl font-black">
                🤫
              </div>
              <h3 className="text-base font-black text-[#0a0a0a] mb-2">Anonymous Guest Chat</h3>
              <p className="text-xs text-[#5b5b55] leading-relaxed">
                Share your personal link (`buzz.app/c/@you`) on Instagram or Twitter. Anyone can message you without logging in or downloading an app.
              </p>
            </div>

            <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
              <div className="h-10 w-10 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#DCF4E4] mb-3 text-xl font-black">
                🎤
              </div>
              <h3 className="text-base font-black text-[#0a0a0a] mb-2">Ghost Voice Effects</h3>
              <p className="text-xs text-[#5b5b55] leading-relaxed">
                Transform voice notes in-browser into Chipmunk, Deep Demon, Robot, or Echo using Web Audio API. 100% private and 0 external server cost.
              </p>
            </div>

            <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
              <div className="h-10 w-10 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FFE0EB] mb-3 text-xl font-black">
                📞
              </div>
              <h3 className="text-base font-black text-[#0a0a0a] mb-2">P2P WebRTC HD Calling</h3>
              <p className="text-xs text-[#5b5b55] leading-relaxed">
                Direct audio and video calling between browsers with network-aware online ringing versus offline calling detection.
              </p>
            </div>

            <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
              <div className="h-10 w-10 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FFF6B8] mb-3 text-xl font-black">
                🎨
              </div>
              <h3 className="text-base font-black text-[#0a0a0a] mb-2">7 Curated Chat Themes</h3>
              <p className="text-xs text-[#5b5b55] leading-relaxed">
                Buzz Cream Minimal, Peony, Holographic, Pink Paradise, Cherry Blossom, Golden Hibiscus, and Floating Oasis with fixed scroll layers.
              </p>
            </div>

            <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
              <div className="h-10 w-10 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#DCF4E4] mb-3 text-xl font-black">
                📸
              </div>
              <h3 className="text-base font-black text-[#0a0a0a] mb-2">24-Hour Moments</h3>
              <p className="text-xs text-[#5b5b55] leading-relaxed">
                Share status updates, photos, and short clips that vanish after 24 hours. Includes live real-time view counts.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="bz-card p-6 md:p-8 shadow-[0_8px_0_0_#0a0a0a]">
          <h2 className="text-xl sm:text-2xl font-black text-[#0a0a0a] mb-4">
            How Buzz Compares to Traditional Messengers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#0a0a0a] bg-[#fffbec]">
                  <th className="p-3 font-black">Feature / Standard</th>
                  <th className="p-3 font-black text-[#0a0a0a] bg-[#FFF6B8]">Buzz Messaging 🇮🇳</th>
                  <th className="p-3 font-black text-[#5b5b55]">WhatsApp</th>
                  <th className="p-3 font-black text-[#5b5b55]">Telegram</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b-2 border-[#0a0a0a]">
                <tr>
                  <td className="p-3 font-bold">Requires Phone Number?</td>
                  <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">NO (Zero Digits)</td>
                  <td className="p-3 text-red-600 font-bold">YES (Mandatory)</td>
                  <td className="p-3 text-red-600 font-bold">YES (Mandatory)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Anonymous Guest Chat Links?</td>
                  <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">YES (No login needed)</td>
                  <td className="p-3 text-red-600 font-bold">NO</td>
                  <td className="p-3 text-red-600 font-bold">NO</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Ghost Voice In-Browser Effects?</td>
                  <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">YES (4 Pitch Filters)</td>
                  <td className="p-3 text-red-600 font-bold">NO</td>
                  <td className="p-3 text-red-600 font-bold">NO</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Web Works Without Phone Battery?</td>
                  <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">YES (100% Independent)</td>
                  <td className="p-3 text-yellow-700 font-bold">Linked multi-device</td>
                  <td className="p-3 text-emerald-800 font-bold">YES</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Contact Book Scraped?</td>
                  <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">NEVER (0 Scrapes)</td>
                  <td className="p-3 text-red-600 font-bold">YES (Entire book)</td>
                  <td className="p-3 text-red-600 font-bold">YES (Optional sync)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#0a0a0a]">Frequently Asked Questions</h2>
          <FaqItem
            q="Can I talk to anyone if I only know their @username?"
            a="Yes! Simply search their @username in Discover or scan their personal QR code. Neither party ever reveals their real phone number."
          />
          <FaqItem
            q="Are audio and video calls free on Buzz?"
            a="Yes. Buzz uses browser-native WebRTC peer-to-peer technology, connecting callers directly with minimal latency and zero hidden costs."
          />
          <FaqItem
            q="How do 24-hour Moments work?"
            a="Moments let you share updates or photos that automatically vanish 24 hours after posting, keeping your profile clean and uncluttered."
          />
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     PAGE 2: NEW DEDICATED GUEST CHAT PAGE (/guest-chat)
     ═══════════════════════════════════════════════════════════════════ */
  if (page === "guest-chat") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20 space-y-20">
        {/* Hero */}
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3 py-1 text-xs font-black text-emerald-900 shadow-[0_2px_0_0_#0a0a0a] mb-4">
              🤫 INTRODUCING GUEST CHAT
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-[#0a0a0a] leading-[1.05] tracking-tight">
              Secret messages.<br />
              <span className="bz-squig">Zero login required.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#5b5b55] font-medium leading-relaxed">
              Every Buzz user gets a permanent personal link: <code className="bg-[#FFF6B8] px-2 py-0.5 rounded font-black border border-[#0a0a0a]">buzz.app/c/@yourname</code>. Share it on your Instagram bio, WhatsApp status, or Twitter. Anyone can send you anonymous secrets and Ghost Voice notes!
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={onLogin} className="bz-btn bz-btn-yellow px-7 py-3.5 text-sm font-black">
                Claim Your Secret Link Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <BuzzRealtimeChatSimulator />
        </div>

        {/* How It Works 4-Step Diagram */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="bz-label">STEP-BY-STEP VIRAL LOOP</span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0a0a0a]">
              How Buzz Guest Chat Works in 4 Steps
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
              <div className="h-10 w-10 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FFF6B8] mb-3 text-xl font-black">
                1
              </div>
              <h3 className="text-base font-black text-[#0a0a0a]">Share Your Link</h3>
              <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                Put your unique <code className="font-bold">/c/@username</code> link or QR card on Instagram, Snapchat, or WhatsApp stories.
              </p>
            </div>

            <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
              <div className="h-10 w-10 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] mb-3 text-xl font-black">
                2
              </div>
              <h3 className="text-base font-black text-[#0a0a0a]">Guest Picks a Nickname</h3>
              <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                Visitors click your link, pick any fun nickname, and start typing. No sign-up, no app install, and no mobile number requested.
              </p>
            </div>

            <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
              <div className="h-10 w-10 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FFE0EB] mb-3 text-xl font-black">
                3
              </div>
              <h3 className="text-base font-black text-[#0a0a0a]">Ghost Voice Disguise</h3>
              <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                Guests can record voice notes disguised with Chipmunk, Robot, Demon, or Deep Pitch filters directly in browser!
              </p>
            </div>

            <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
              <div className="h-10 w-10 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#DCF4E4] mb-3 text-xl font-black">
                4
              </div>
              <h3 className="text-base font-black text-[#0a0a0a]">Direct Owner Inbox</h3>
              <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                Replies land straight in your private <code className="font-bold">/guests</code> inbox. You can chat back or share cards on your story!
              </p>
            </div>
          </div>
        </div>

        {/* Ghost Voice Filter Showcase */}
        <div className="bz-card p-8 bg-[#fffbec] shadow-[0_8px_0_0_#0a0a0a]">
          <div className="max-w-2xl mb-8">
            <span className="bz-label">IN-BROWSER AUDIO TECHNOLOGY</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0a0a0a] mt-2">
              4 Ghost Voice Effects. 100% Free & Private.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5b5b55] font-medium leading-relaxed">
              Unlike other platforms that send your voice to cloud AI servers, Buzz's Ghost Voice runs 100% client-side inside your browser using the HTML5 Web Audio API. Your original voice is never stored.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="bz-card p-4 bg-white shadow-[0_3px_0_0_#0a0a0a]">
              <span className="text-2xl">🐿️</span>
              <h4 className="mt-2 font-black text-sm text-[#0a0a0a]">Chipmunk Filter</h4>
              <p className="mt-1 text-[11px] text-[#5b5b55]">High-pitch playful frequency modulation for lighthearted banter.</p>
            </div>
            <div className="bz-card p-4 bg-white shadow-[0_3px_0_0_#0a0a0a]">
              <span className="text-2xl">🤖</span>
              <h4 className="mt-2 font-black text-sm text-[#0a0a0a]">Cyborg Robot</h4>
              <p className="mt-1 text-[11px] text-[#5b5b55]">Metallic ring modulation giving voices an anonymous futuristic tone.</p>
            </div>
            <div className="bz-card p-4 bg-white shadow-[0_3px_0_0_#0a0a0a]">
              <span className="text-2xl">😈</span>
              <h4 className="mt-2 font-black text-sm text-[#0a0a0a]">Deep Demon</h4>
              <p className="mt-1 text-[11px] text-[#5b5b55]">Low octave sub-bass shifting for completely unrecognizable voice notes.</p>
            </div>
            <div className="bz-card p-4 bg-white shadow-[0_3px_0_0_#0a0a0a]">
              <span className="text-2xl">🌌</span>
              <h4 className="mt-2 font-black text-sm text-[#0a0a0a]">Cosmic Echo</h4>
              <p className="mt-1 text-[11px] text-[#5b5b55]">Reverberated spatial delay effect designed for atmospheric storytelling.</p>
            </div>
          </div>
        </div>

        {/* Guest Chat FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#0a0a0a]">Guest Chat & Ghost Voice FAQs</h2>
          <FaqItem
            q="Does the person sending me a secret message need a Buzz account?"
            a="No! Anyone with a web browser can open your link, type a nickname, and send messages or Ghost Voice notes immediately."
          />
          <FaqItem
            q="Can the guest reveal their identity or sign up later?"
            a="Yes! If the guest enjoys the chat, they can tap 'Claim Username' on their screen to register a permanent Buzz account and continue chatting."
          />
          <FaqItem
            q="Can I block abusive or spam guests?"
            a="Yes. Every guest thread has a 1-tap Block button inside your Guest Inbox, immediately disabling further messages from that guest token."
          />
          <FaqItem
            q="Are guest messages permanent?"
            a="Guest messages automatically clean up after 24 hours of inactivity, keeping your inbox fresh and your server footprint zero."
          />
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     PAGE 3: PRIVACY (LONG PRIVACY MANIFESTO)
     ═══════════════════════════════════════════════════════════════════ */
  if (page === "privacy") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20 space-y-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3 py-1 text-xs font-black text-emerald-900 shadow-[0_2px_0_0_#0a0a0a] mb-4">
              <ShieldCheck className="h-3.5 w-3.5" /> ZERO-PHONE-NUMBER PRIVACY
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-[#0a0a0a] leading-[1.05] tracking-tight">
              Privacy isn't a setting.<br />
              <span className="bz-squig">It's the architecture.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#5b5b55] font-medium leading-relaxed">
              When an app demands your phone number, they link your digital chats directly to your SIM identity, Aadhaar, UPI bank accounts, and advertising data brokers. Buzz stops the surveillance cycle.
            </p>
            <button onClick={onLogin} className="mt-8 bz-btn bz-btn-yellow px-7 py-3.5 text-sm font-black">
              Create Your Private Identity <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <BuzzRealtimeChatSimulator />
        </div>

        {/* 4 Privacy Pillars */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FFF6B8] mb-4">
              <LockKeyhole className="h-6 w-6 text-[#0a0a0a]" />
            </div>
            <h2 className="text-base font-black text-[#0a0a0a]">No Phone Number Identity</h2>
            <p className="mt-2 text-xs text-[#5b5b55] font-medium leading-relaxed">
              Sign up with just a username and password. You will never receive spam calls, SIM-swap attacks, or phone-linked data leaks.
            </p>
          </div>

          <div className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#E2ECFF] mb-4">
              <Shield className="h-6 w-6 text-[#0a0a0a]" />
            </div>
            <h2 className="text-base font-black text-[#0a0a0a]">Row-Level Security (RLS)</h2>
            <p className="mt-2 text-xs text-[#5b5b55] font-medium leading-relaxed">
              Messages and push tokens are strictly gated by database-level cryptographic policies. Only you and your chat partner can read your messages.
            </p>
          </div>

          <div className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#DCF4E4] mb-4">
              <Sparkles className="h-6 w-6 text-emerald-800" />
            </div>
            <h2 className="text-base font-black text-[#0a0a0a]">Ephemeral Auto-Cleanup</h2>
            <p className="mt-2 text-xs text-[#5b5b55] font-medium leading-relaxed">
              Guest chats are tokenized and automatically expire. Moments vanish after 24 hours. Your digital footprint remains clean.
            </p>
          </div>
        </div>

        {/* Privacy Manifesto Section */}
        <div className="bz-card p-8 bg-white shadow-[0_8px_0_0_#0a0a0a]">
          <span className="bz-label">OUR PRIVACY PLEDGE</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0a0a0a] mt-2 mb-4">
            What Buzz Never Collects or Sells
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 text-xs text-[#0a0a0a]">
            <div className="flex items-start gap-2.5">
              <span className="text-red-600 font-black text-base shrink-0">✕</span>
              <span><strong>No Mobile Numbers:</strong> We will never ask for your 10-digit SIM number or send OTP SMS.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-red-600 font-black text-base shrink-0">✕</span>
              <span><strong>No Address Book Scraping:</strong> Buzz never reads, uploads, or compares your phone contact list.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-red-600 font-black text-base shrink-0">✕</span>
              <span><strong>No Ad Retargeting:</strong> We have zero commercial data trackers, Google Analytics, or Meta Pixel.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-red-600 font-black text-base shrink-0">✕</span>
              <span><strong>No Location Tracking:</strong> Buzz does not track GPS coordinates or Wi-Fi beacon history.</span>
            </div>
          </div>
        </div>

        {/* Privacy FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#0a0a0a]">Privacy & Security FAQs</h2>
          <FaqItem
            q="How are my messages protected?"
            a="Messages are protected by Row-Level Security (RLS) policies at the database layer. No user can read another person's messages without matching cryptographic session tokens."
          />
          <FaqItem
            q="What happens if I lose my phone?"
            a="Because Buzz identity is based on your username and password, you can simply open Buzz on any computer or replacement phone, log in, and regain full access instantly."
          />
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     PAGE 4: BUZZ WEB (LONG DESKTOP ADVANTAGES)
     ═══════════════════════════════════════════════════════════════════ */
  if (page === "buzz-web") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20 space-y-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#E2ECFF] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a] mb-4">
              <Globe className="h-3.5 w-3.5" /> 100% INDEPENDENT BROWSER CHAT
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-[#0a0a0a] leading-[1.05] tracking-tight">
              Buzz on your<br />
              <span className="bz-squig">Big Screen.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#5b5b55] font-medium leading-relaxed">
              Unlike WhatsApp Web which requires your mobile phone to be tethered and online, Buzz Web is completely autonomous. Your laptop chats independently even if your phone runs out of battery.
            </p>
            <div className="mt-8 flex gap-3">
              <button onClick={onLogin} className="bz-btn bz-btn-yellow px-7 py-3.5 text-sm font-black">
                Launch Buzz Web Free <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <BuzzRealtimeChatSimulator />
        </div>

        {/* 3 Productivity Pillars */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <h3 className="font-black text-sm text-[#0a0a0a]">⚡ Keyboard Productivity</h3>
            <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
              Full desktop keyboard support: Enter to send, Shift+Enter for clean line breaks, quick emoji picker, and global search.
            </p>
          </div>
          <div className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <h3 className="font-black text-sm text-[#0a0a0a]">📹 In-Browser HD Calling</h3>
            <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
              Make WebRTC voice and video calls directly through Chrome, Safari, or Edge without installing bulky third-party call plugins.
            </p>
          </div>
          <div className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <h3 className="font-black text-sm text-[#0a0a0a]">🔒 Zero Phone Dependency</h3>
            <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
              Runs 100% in the cloud. You do not need to scan a QR code every few weeks or keep your phone nearby.
            </p>
          </div>
        </div>

        {/* Browser Compatibility Matrix */}
        <div className="bz-card p-8 bg-white shadow-[0_8px_0_0_#0a0a0a]">
          <h2 className="text-xl sm:text-2xl font-black text-[#0a0a0a] mb-4">Supported Desktop Browsers</h2>
          <div className="grid gap-4 sm:grid-cols-4 text-xs font-bold text-[#0a0a0a]">
            <div className="p-4 rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec]">
              <span className="text-lg">🌐</span>
              <p className="mt-2">Google Chrome</p>
              <span className="text-[10px] text-emerald-800">100% Supported</span>
            </div>
            <div className="p-4 rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec]">
              <span className="text-lg">🧭</span>
              <p className="mt-2">Apple Safari (Mac/iPad)</p>
              <span className="text-[10px] text-emerald-800">100% Supported</span>
            </div>
            <div className="p-4 rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec]">
              <span className="text-lg">⚡</span>
              <p className="mt-2">Microsoft Edge</p>
              <span className="text-[10px] text-emerald-800">100% Supported</span>
            </div>
            <div className="p-4 rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec]">
              <span className="text-lg">🦁</span>
              <p className="mt-2">Brave & Firefox</p>
              <span className="text-[10px] text-emerald-800">100% Supported</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     PAGE 5: DOWNLOAD (LONG PWA GUIDE)
     ═══════════════════════════════════════════════════════════════════ */
  if (page === "download") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20 space-y-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a] mb-4">
              <Smartphone className="h-3.5 w-3.5" /> UNDER 5MB INSTANT PWA
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-[#0a0a0a] leading-[1.05] tracking-tight">
              Buzz on every<br />
              <span className="bz-squig">single device.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#5b5b55] font-medium leading-relaxed">
              No 150MB bulky app downloads. No waiting for app store approvals. Install Buzz directly from your browser as a Progressive Web App (PWA) with instant updates and offline caching.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <InstallAppDialog
                trigger={
                  <button className="bz-btn bz-btn-yellow px-7 py-3.5 text-sm font-black">
                    <ArrowDownToLine className="h-4 w-4" /> Install Buzz Now
                  </button>
                }
              />
              <button onClick={onLogin} className="bz-btn bz-btn-white px-6 py-3.5 text-sm font-bold">
                Open In Web Browser
              </button>
            </div>
          </div>

          <div className="bz-card p-6 text-center max-w-md mx-auto shadow-[0_8px_0_0_#0a0a0a]">
            <h3 className="text-sm font-black text-[#0a0a0a] mb-2">Scan with Phone to Install</h3>
            <div className="inline-block rounded-2xl border-3 border-[#0a0a0a] bg-white p-4 shadow-[0_4px_0_0_#0a0a0a]">
              <QRCodeSVG value="https://chat-without-digits.lovable.app" size={160} level="H" />
            </div>
            <p className="mt-3 text-[11px] font-mono font-bold text-[#5b5b55]">
              https://chat-without-digits.lovable.app
            </p>
          </div>
        </div>

        {/* Installation Instructions for Platforms */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <span className="bz-label">ANDROID PHONES</span>
            <h4 className="mt-2 text-sm font-black text-[#0a0a0a]">Chrome, Edge & Brave</h4>
            <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
              Open Buzz in Chrome on Android. Tap the <strong>three dots</strong> in top right and choose <strong>"Install app"</strong> or tap the yellow Install banner at the bottom.
            </p>
          </div>
          <div className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <span className="bz-label">APPLE iOS & iPAD</span>
            <h4 className="mt-2 text-sm font-black text-[#0a0a0a]">Safari on iPhone / iPad</h4>
            <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
              Open the link in Safari, tap the <strong>Share</strong> button (box with upward arrow), scroll down, and select <strong>"Add to Home Screen"</strong>.
            </p>
          </div>
          <div className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <span className="bz-label">WINDOWS & MAC</span>
            <h4 className="mt-2 text-sm font-black text-[#0a0a0a]">Desktop App Window</h4>
            <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
              Look for the install icon inside your address bar next to the bookmark star, click <strong>"Install Buzz"</strong>, and it will launch in a dedicated borderless window.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     PAGE 6: CONTACT
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-20">
      <div className="bz-card p-6 md:p-10 shadow-[0_8px_0_0_#0a0a0a]">
        <span className="bz-label">BUZZ SUPPORT & COMMUNITY</span>
        <h1 className="mt-2 text-3xl sm:text-5xl font-black text-[#0a0a0a] tracking-tight">
          Contact Buzz Team 📬
        </h1>
        <p className="mt-3 text-sm text-[#5b5b55] font-medium">
          Have feedback, feature requests, or questions? Send us a direct note at{" "}
          <a href="mailto:prasadprem904@gmail.com" className="font-bold underline text-[#0a0a0a]">
            prasadprem904@gmail.com
          </a>
          .
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `mailto:prasadprem904@gmail.com?subject=${encodeURIComponent(
              `Buzz inquiry from ${name}`
            )}&body=${encodeURIComponent(`${message}\n\nFrom: ${name}\nReply to: ${email}`)}`;
          }}
        >
          <div>
            <label className="text-xs font-black text-[#0a0a0a]">Your Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              className="mt-1 w-full rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] p-3 text-xs font-bold outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-black text-[#0a0a0a]">Your Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="mt-1 w-full rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] p-3 text-xs font-bold outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-black text-[#0a0a0a]">Message or Feedback</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you love or what we should build next..."
              className="mt-1 w-full rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] p-3 text-xs font-bold outline-none resize-none"
            />
          </div>

          <button type="submit" className="bz-btn bz-btn-yellow w-full py-3.5 text-xs font-black uppercase">
            <Send className="h-4 w-4" /> Send Direct Message
          </button>
        </form>
      </div>
    </div>
  );
}
