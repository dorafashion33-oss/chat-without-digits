import { useState, useRef, useEffect } from "react";
import {
  Check,
  CheckCheck,
  ChevronDown,
  Cpu,
  Flag,
  HeartHandshake,
  KeyRound,
  Mic,
  Phone,
  Send,
  Shield,
  Smile,
  Smartphone,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react";
import InstallAppDialog from "@/components/chat/InstallAppDialog";
import { QRCodeSVG } from "qrcode.react";

export type PublicPage =
  | "features"
  | "guest-chat"
  | "made-in-india"
  | "privacy"
  | "buzz-web"
  | "download"
  | "contact";

export const publicPages: PublicPage[] = [
  "features",
  "guest-chat",
  "made-in-india",
  "privacy",
  "buzz-web",
  "download",
  "contact",
];

/* ═══════════════════════════════════════════════════════════════════
   1. REAL-TIME BUZZ CHAT SIMULATOR (AUTHENTIC LIVE INTERFACE)
   ═══════════════════════════════════════════════════════════════════ */
export function BuzzRealtimeChatSimulator() {
  const [messages, setMessages] = useState<
    Array<{ id: number; sender: "aarav" | "me"; text: string; time: string; status?: "read" }>
  >([
    { id: 1, sender: "aarav", text: "Hey! WhatsApp chorh diya? Buzz par kyu shift hua?", time: "10:14 AM" },
    { id: 2, sender: "me", text: "No phone numbers needed! Identity sirf @username se chalti hai. 🇮🇳", time: "10:15 AM", status: "read" },
    { id: 3, sender: "aarav", text: "Sach me? Toh kisi stranger ko mera mobile number nahi dikhega?", time: "10:15 AM" },
    { id: 4, sender: "me", text: "Zero number sharing! Plus Guest Chat se bina account banaye koi bhi secret message bhej sakta hai.", time: "10:16 AM", status: "read" },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "me" as const,
      text: inputVal.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "read" as const,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal("");

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "Ghost Voice suno mera! Maine mafia effect lagaya hai. 🕶️",
        "P2P WebRTC calls me sound crystal clear hai bina kisi latency ke!",
        "Indian tricolor branding dekh kar dil khush ho gaya! Jai Hind! 🇮🇳",
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "aarav",
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1200);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl border-3 border-[#0a0a0a] bg-[#FFFDF7] shadow-[8px_8px_0_0_#0a0a0a] overflow-hidden text-left">
      <div className="flex items-center justify-between border-b-3 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#0a0a0a] font-black text-white text-sm shadow-[2px_2px_0_0_#0a0a0a]">
              AP
            </div>
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#0a0a0a] bg-[#22c55e]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-[#0a0a0a]">Aarav Patel</h4>
              <span className="rounded-md border border-[#0a0a0a] bg-white px-1.5 py-0.2 text-[9px] font-black">
                @aarav_buzz
              </span>
            </div>
            <p className="text-[11px] font-bold text-[#0a0a0a]/70">
              {isTyping ? <span className="text-[#2563eb] animate-pulse">typing a message...</span> : "Online · End-to-End Encrypted"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[2px_2px_0_0_#0a0a0a]">
            <Phone className="h-4 w-4 text-[#0a0a0a]" />
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[2px_2px_0_0_#0a0a0a]">
            <Video className="h-4 w-4 text-[#0a0a0a]" />
          </div>
        </div>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-[#fffbec]/40">
        <div className="text-center my-1">
          <span className="rounded-full border border-[#0a0a0a] bg-white px-3 py-1 text-[10px] font-black text-[#0a0a0a] shadow-[1px_1px_0_0_#0a0a0a]">
            🔒 Messages & Calls are End-to-End Encrypted
          </span>
        </div>

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] rounded-2xl border-2 border-[#0a0a0a] p-3 text-xs font-bold leading-relaxed shadow-[2px_2px_0_0_#0a0a0a] ${
                m.sender === "me" ? "bg-[#FCE314] text-[#0a0a0a]" : "bg-white text-[#0a0a0a]"
              }`}
            >
              <p>{m.text}</p>
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                <span>{m.time}</span>
                {m.sender === "me" && <CheckCheck className="h-3.5 w-3.5 text-[#2563eb]" />}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-xl border-2 border-[#0a0a0a] bg-white px-3 py-2 shadow-[2px_2px_0_0_#0a0a0a] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0a0a0a] animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-[#0a0a0a] animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-[#0a0a0a] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t-3 border-[#0a0a0a] bg-[#FFF6B8] p-3 flex items-center gap-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[2px_2px_0_0_#0a0a0a]">
          <Smile className="h-4 w-4 text-[#0a0a0a]" />
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Try chatting with Aarav in Buzz..."
          className="flex-1 rounded-xl border-2 border-[#0a0a0a] bg-white px-3.5 py-2 text-xs font-bold shadow-[2px_2px_0_0_#0a0a0a] focus:outline-none"
        />
        <button
          type="submit"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-[2px_2px_0_0_#0a0a0a] transition-all hover:bg-neutral-800"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function FaqAccordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border-2 border-[#0a0a0a] bg-white p-4 shadow-[3px_3px_0_0_#0a0a0a] text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 text-left font-black text-sm text-[#0a0a0a]"
      >
        <span>{question}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="mt-3 text-xs font-bold leading-relaxed text-[#0a0a0a]/80 border-t-2 border-[#0a0a0a]/10 pt-3">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function BuzzPublicPage({
  page,
  onLogin,
}: {
  page: PublicPage;
  onLogin: () => void;
}) {
  const [installOpen, setInstallOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#0a0a0a]">
      {/* ──────────────── PAGE 1: FEATURES ──────────────── */}
      {page === "features" && (
        <div className="space-y-16 py-12 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#FCE314] px-4 py-1.5 text-xs font-black shadow-[3px_3px_0_0_#0a0a0a]">
              ⚡ 100+ Pro Features Built-in
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">
              Everything WhatsApp Has, Plus What They Refuse To Build.
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base font-bold text-[#0a0a0a]/80">
              Zero phone numbers required. Instant guest messaging. Audio voice modulators. P2P WebRTC calls.
              All packed in an ultra-fast paper-cream neo-editorial design.
            </p>
          </div>

          <div className="space-y-4 text-center">
            <h3 className="text-lg font-black uppercase text-[#0a0a0a]">Live Interactive Buzz Chat Experience</h3>
            <BuzzRealtimeChatSimulator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {[
              {
                icon: Shield,
                title: "Zero Phone Identity",
                desc: "Never reveal your personal phone number or email to strangers or group members. Your @username handle is your sovereign passport.",
              },
              {
                icon: Mic,
                title: "Ghost Voice Filters",
                desc: "Send audio with Deep Mafia, Cyber Robot, Whisper Echo or Ghost effects directly modulated in the browser with 0 server latency.",
              },
              {
                icon: KeyRound,
                title: "Biometric & PIN App Lock",
                desc: "Instantly lock your conversations with a tactile 4-digit PIN lock screen that secures your chats even when your phone is unlocked.",
              },
              {
                icon: Zap,
                title: "P2P WebRTC HD Calling",
                desc: "Peer-to-peer audio and video calls directly through Google STUN network. Zero cloud latency and maximum acoustic privacy.",
              },
              {
                icon: Sparkles,
                title: "7 Neo-Editorial Themes",
                desc: "Choose between Buzz Cream, Peony, Holographic, Pink Paradise, Cherry Blossom, Golden Hibiscus, and Floating Oasis wallpapers.",
              },
              {
                icon: Users,
                title: "Secure Group Streams",
                desc: "Host group conversations with granular member controls, group voice calling, message forwarding filters, and media sharing.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-6 shadow-[5px_5px_0_0_#0a0a0a] space-y-3 text-left transition-all hover:-translate-y-1"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FCE314] shadow-[2px_2px_0_0_#0a0a0a]">
                  <f.icon className="h-6 w-6 text-[#0a0a0a]" />
                </div>
                <h3 className="text-base font-black uppercase text-[#0a0a0a]">{f.title}</h3>
                <p className="text-xs font-bold leading-relaxed text-[#0a0a0a]/75">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-6 sm:p-8 shadow-[7px_7px_0_0_#0a0a0a] space-y-6">
            <h2 className="text-2xl font-black uppercase text-center text-[#0a0a0a]">
              Buzz vs Traditional Messaging Apps
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8]">
                    <th className="p-3 text-sm font-black">Capability</th>
                    <th className="p-3 text-sm font-black text-[#0a0a0a]">Buzz Messenger</th>
                    <th className="p-3 text-sm font-black text-[#0a0a0a]/60">WhatsApp</th>
                    <th className="p-3 text-sm font-black text-[#0a0a0a]/60">Telegram</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#0a0a0a]/10">
                  {[
                    ["Phone Number Mandatory?", "❌ NO (Only @handle)", "⚠️ YES (Revealed to all)", "⚠️ YES (Mandatory on signup)"],
                    ["Anonymous Guest Chat Link?", "✅ YES (/c/@username)", "❌ NO", "❌ NO"],
                    ["Voice Modulation (Ghost Voice)?", "✅ 5 In-Browser Filters", "❌ NO", "❌ NO"],
                    ["PWA Offline Standalone?", "✅ Instant Zero-Store", "❌ Cloud Web Only", "❌ Cloud Web Only"],
                    ["Auto-Cleanup Engine?", "✅ Client Database Scrub", "❌ Manual Only", "❌ Manual Only"],
                    ["Proud Made In India Tech?", "✅ 100% Indian Pride", "❌ Meta (US)", "❌ Dubai / Offshore"],
                  ].map(([cap, bz, wa, tg], idx) => (
                    <tr key={idx} className="hover:bg-[#FFFDF7]">
                      <td className="p-3 font-black text-[#0a0a0a]">{cap}</td>
                      <td className="p-3 font-black text-[#16a34a]">{bz}</td>
                      <td className="p-3 text-[#0a0a0a]/70">{wa}</td>
                      <td className="p-3 text-[#0a0a0a]/70">{tg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h3 className="text-xl font-black uppercase text-center text-[#0a0a0a]">Frequently Asked Questions</h3>
            <FaqAccordion
              question="Can someone find my phone number if I chat with them on Buzz?"
              answer="Never! Buzz is engineered with zero phone number identity. Your contact list is never uploaded or scrutinized. All communication happens strictly via your @username handle."
            />
            <FaqAccordion
              question="Does Buzz cost anything to use?"
              answer="Buzz is completely free to install, message, and call with zero subscription barriers. All WebRTC voice and video calls run peer-to-peer."
            />
            <FaqAccordion
              question="How do I lock my chats on Buzz?"
              answer="Go to Settings > Privacy > App Lock. Set your custom 4-digit security PIN and your conversations will require the PIN every time you open Buzz."
            />
          </div>
        </div>
      )}

      {/* ──────────────── PAGE 2: GUEST CHAT ──────────────── */}
      {page === "guest-chat" && (
        <div className="space-y-16 py-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-1.5 text-xs font-black shadow-[3px_3px_0_0_#0a0a0a]">
              🤫 Viral Anonymous Messaging
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">
              Receive Secret Confessions & Feedback With Zero Login Required.
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base font-bold text-[#0a0a0a]/80">
              Share your personal link: <code className="bg-[#FCE314] px-2 py-0.5 rounded border border-[#0a0a0a]">chat-without-digits.lovable.app/c/@yourname</code>.
              Anyone can send secret text notes or disguised Ghost Voice audio notes right from their browser!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                step: "01",
                title: "Copy Your Secret Link",
                desc: "Claim your unique @username on Buzz and copy your personal /c/@handle link with a single tap.",
              },
              {
                step: "02",
                title: "Put On Instagram / WhatsApp",
                desc: "Post your link to your Stories, Status, or Bio with captions like 'Send me honest feedback or secret confessions!'",
              },
              {
                step: "03",
                title: "Reply in Guest Inbox",
                desc: "Read incoming confessions in your Guest Inbox, reply directly, or listen to their modulated Ghost Voice clips.",
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-6 shadow-[5px_5px_0_0_#0a0a0a] space-y-3"
              >
                <span className="inline-block rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] px-3 py-1 text-sm font-black shadow-[2px_2px_0_0_#0a0a0a]">
                  Step {s.step}
                </span>
                <h3 className="text-base font-black uppercase text-[#0a0a0a]">{s.title}</h3>
                <p className="text-xs font-bold leading-relaxed text-[#0a0a0a]/75">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border-3 border-[#0a0a0a] bg-[#FFF6B8] p-8 shadow-[7px_7px_0_0_#0a0a0a] max-w-md mx-auto space-y-4">
            <h3 className="text-base font-black uppercase text-[#0a0a0a]">Scan Demo Guest Chat QR</h3>
            <div className="grid place-items-center p-4 bg-white rounded-2xl border-2 border-[#0a0a0a] shadow-[3px_3px_0_0_#0a0a0a]">
              <QRCodeSVG value="https://chat-without-digits.lovable.app/c/buzz" size={160} />
            </div>
            <p className="text-xs font-bold text-[#0a0a0a]/70">
              Point your smartphone camera to open the instant guest chat interface without downloading or logging in!
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h3 className="text-xl font-black uppercase text-center text-[#0a0a0a]">Guest Chat Security & Privacy</h3>
            <FaqAccordion
              question="Can the owner see the guest's IP address or phone number?"
              answer="No. Buzz does not store or share IP addresses, phone numbers, or hardware fingerprints. The sender is identified purely by their chosen nickname."
            />
            <FaqAccordion
              question="Can the guest turn their nickname into a permanent account?"
              answer="Yes! At any time, a guest can tap 'Claim Username' to convert their nickname into a real Buzz account, preserving their identity."
            />
          </div>
        </div>
      )}

      {/* ──────────────── PAGE 3: MADE IN INDIA ──────────────── */}
      {page === "made-in-india" && (
        <div className="space-y-16 py-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#0a0a0a] bg-white px-4 py-1.5 text-xs font-black shadow-[3px_3px_0_0_#0a0a0a]">
              <span className="h-3 w-3 rounded-full bg-[#ff9933]" />
              <span className="h-3 w-3 rounded-full bg-white border border-[#0a0a0a]" />
              <span className="h-3 w-3 rounded-full bg-[#138808]" />
              Proudly Built In India For The World
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">
              Bharat Ka Apna Sovereign Messaging Platform.
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base font-bold text-[#0a0a0a]/80">
              Built to liberate Indian citizens from foreign surveillance monopolies. No tracking, no forced contact
              sync, and zero phone number sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: Flag,
                title: "Zero Foreign Data Harvest",
                desc: "Foreign tech giants exploit Indian user networks for behavioral ads. Buzz operates on strict zero-surveillance architecture.",
              },
              {
                icon: Cpu,
                title: "High Performance on Indian 2G/3G/4G/5G",
                desc: "Engineered with lightweight assets, sub-8KB voice modulation, and client-side caching to work flawlessly across all Indian mobile networks.",
              },
              {
                icon: HeartHandshake,
                title: "Hindi & Regional Pride",
                desc: "Integrated one-tap Hindi language mode with intuitive Indic design tokens that respect every citizen's digital dignity.",
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-6 shadow-[5px_5px_0_0_#0a0a0a] space-y-3"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FFF6B8] shadow-[2px_2px_0_0_#0a0a0a]">
                  <p.icon className="h-6 w-6 text-[#0a0a0a]" />
                </div>
                <h3 className="text-base font-black uppercase text-[#0a0a0a]">{p.title}</h3>
                <p className="text-xs font-bold leading-relaxed text-[#0a0a0a]/75">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border-3 border-[#0a0a0a] bg-[#FFFDF7] p-8 shadow-[7px_7px_0_0_#0a0a0a] space-y-4 max-w-2xl mx-auto border-dashed">
            <h3 className="text-lg font-black uppercase text-[#0a0a0a]">Sovereign Technology Pledge</h3>
            <p className="text-xs font-bold leading-relaxed text-[#0a0a0a]/80">
              "We believe that India's digital future cannot be rented from Silicon Valley. Communication is a fundamental
              human right that deserves unbreakable privacy, zero telephone harassment, and absolute user ownership."
            </p>
            <div className="pt-2 flex justify-center">
              <span className="rounded-xl border-2 border-[#0a0a0a] bg-[#0a0a0a] px-4 py-1.5 text-xs font-black uppercase text-white shadow-[2px_2px_0_0_#0a0a0a]">
                🇮🇳 Swadeshi Tech Revolution
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── PAGE 4: PRIVACY ──────────────── */}
      {page === "privacy" && (
        <div className="space-y-16 py-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-white px-4 py-1.5 text-xs font-black shadow-[3px_3px_0_0_#0a0a0a]">
              🔒 Zero-Knowledge Security Protocol
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">
              Your Privacy Is Not A Feature. It Is Our Fundamental Law.
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base font-bold text-[#0a0a0a]/80">
              We designed Buzz so that we cannot read your personal chats, listen to your WebRTC calls, or trace who you speak with.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              {
                title: "1. No Address Book Scanning",
                desc: "Traditional apps demand complete access to your phone contacts before allowing you to send a message. Buzz never asks for contacts permission.",
              },
              {
                title: "2. Peer-to-Peer Calling",
                desc: "Voice and video calls establish direct P2P connections via WebRTC. Audio packets travel directly between participant devices.",
              },
              {
                title: "3. Disguised Audio Processing",
                desc: "Ghost Voice filters are computed directly inside your browser's Web Audio API using mathematical convolution before transmission.",
              },
              {
                title: "4. Database RLS Defense",
                desc: "Every database table enforces Row Level Security (RLS) guaranteeing that only authenticated conversation members can query their messages.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-6 shadow-[5px_5px_0_0_#0a0a0a] space-y-2"
              >
                <h3 className="text-base font-black uppercase text-[#0a0a0a]">{item.title}</h3>
                <p className="text-xs font-bold leading-relaxed text-[#0a0a0a]/75">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h3 className="text-xl font-black uppercase text-center text-[#0a0a0a]">Privacy FAQ</h3>
            <FaqAccordion
              question="Do you sell data to advertisers?"
              answer="Never. We run zero third-party advertising trackers, zero telemetry pixels, and zero behavioral analytics. Your data is not monetized."
            />
            <FaqAccordion
              question="Can government agencies or third parties intercept my messages?"
              answer="Buzz enforces strict database RLS access control and peer-to-peer data transport. We do not store plaintext passwords or phone-linked identity logs."
            />
          </div>
        </div>
      )}

      {/* ──────────────── PAGE 5: BUZZ WEB ──────────────── */}
      {page === "buzz-web" && (
        <div className="space-y-16 py-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#FCE314] px-4 py-1.5 text-xs font-black shadow-[3px_3px_0_0_#0a0a0a]">
              💻 Instant Browser Access
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">
              Buzz On Any Desktop, Laptop Or Tablet Without QR Linking.
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base font-bold text-[#0a0a0a]/80">
              Unlike WhatsApp Web which requires your mobile phone to stay connected to the internet, Buzz Web runs
              independently on Chrome, Edge, Safari, Firefox, and Brave.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: "Independent Session",
                desc: "Your phone battery died? No problem. Log in with your @username on any computer and continue chatting seamlessly.",
              },
              {
                title: "Keyboard Shortcuts",
                desc: "Fast navigation with Enter to send, Shift+Enter for new line, Esc to exit modals, and instant forward search.",
              },
              {
                title: "Drag & Drop Media",
                desc: "Send high-resolution photos and documents directly by dragging them from your computer desktop straight into the chat.",
              },
            ].map((w, idx) => (
              <div
                key={idx}
                className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-6 shadow-[5px_5px_0_0_#0a0a0a] space-y-2"
              >
                <h3 className="text-base font-black uppercase text-[#0a0a0a]">{w.title}</h3>
                <p className="text-xs font-bold leading-relaxed text-[#0a0a0a]/75">{w.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border-3 border-[#0a0a0a] bg-[#FFF6B8] p-8 shadow-[7px_7px_0_0_#0a0a0a] max-w-xl mx-auto space-y-4">
            <h3 className="text-base font-black uppercase text-[#0a0a0a]">Launch Buzz Web Now</h3>
            <p className="text-xs font-bold text-[#0a0a0a]/80">
              No QR code linking dance required. Simply sign in with your sovereign handle and password.
            </p>
            <button
              type="button"
              onClick={onLogin}
              className="rounded-xl border-2 border-[#0a0a0a] bg-[#0a0a0a] px-6 py-3 text-xs font-black uppercase text-white shadow-[3px_3px_0_0_#0a0a0a] hover:bg-neutral-800"
            >
              Open Buzz Web
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── PAGE 6: DOWNLOAD ──────────────── */}
      {page === "download" && (
        <div className="space-y-16 py-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#22c55e] px-4 py-1.5 text-xs font-black text-white shadow-[3px_3px_0_0_#0a0a0a]">
              📲 Install on Android & iOS
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">
              Install Buzz Directly. Zero Play Store Surveillance.
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base font-bold text-[#0a0a0a]/80">
              Buzz is a Progressive Web App (PWA). It installs directly to your home screen with a single tap, consumes
              under 2MB storage, and updates automatically without downloading large 80MB updates!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-7 shadow-[6px_6px_0_0_#0a0a0a] space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FCE314] shadow-[2px_2px_0_0_#0a0a0a]">
                  <Smartphone className="h-6 w-6 text-[#0a0a0a]" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-[#0a0a0a]">Android Installation</h3>
                  <p className="text-xs font-bold text-[#0a0a0a]/60">Chrome / Brave / Edge</p>
                </div>
              </div>
              <ol className="space-y-2 text-xs font-bold text-[#0a0a0a]/80 list-decimal pl-4">
                <li>Open <code>https://chat-without-digits.lovable.app</code> in Chrome.</li>
                <li>Tap the <strong>three dots (⋮)</strong> in the top right browser corner.</li>
                <li>Select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>Buzz will appear as a native app on your phone app drawer!</li>
              </ol>
              <button
                type="button"
                onClick={() => setInstallOpen(true)}
                className="w-full rounded-xl border-2 border-[#0a0a0a] bg-[#0a0a0a] py-2.5 text-xs font-black uppercase text-white shadow-[2px_2px_0_0_#0a0a0a]"
              >
                Install on Android Now
              </button>
            </div>

            <div className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-7 shadow-[6px_6px_0_0_#0a0a0a] space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FFF6B8] shadow-[2px_2px_0_0_#0a0a0a]">
                  <Smartphone className="h-6 w-6 text-[#0a0a0a]" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-[#0a0a0a]">iPhone & iPad (iOS)</h3>
                  <p className="text-xs font-bold text-[#0a0a0a]/60">Safari Browser</p>
                </div>
              </div>
              <ol className="space-y-2 text-xs font-bold text-[#0a0a0a]/80 list-decimal pl-4">
                <li>Open <code>https://chat-without-digits.lovable.app</code> in Safari.</li>
                <li>Tap the <strong>Share button (box with arrow ↑)</strong> at the bottom.</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                <li>Tap <strong>"Add"</strong> in top right. You're ready to buzz!</li>
              </ol>
              <button
                type="button"
                onClick={() => setInstallOpen(true)}
                className="w-full rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] py-2.5 text-xs font-black uppercase text-[#0a0a0a] shadow-[2px_2px_0_0_#0a0a0a]"
              >
                View iOS Install Dialog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── PAGE 7: CONTACT ──────────────── */}
      {page === "contact" && (
        <div className="space-y-16 py-12 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#0a0a0a]">
              Direct Contact & Community Support
            </h1>
            <p className="text-sm sm:text-base font-bold text-[#0a0a0a]/80">
              Need assistance or want to suggest a new feature for Buzz? Talk to us directly without bureaucracy.
            </p>
          </div>
          <div className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-8 shadow-[7px_7px_0_0_#0a0a0a] max-w-lg mx-auto text-left space-y-4">
            <div>
              <label className="text-xs font-black uppercase text-[#0a0a0a]">Your @Username or Email</label>
              <input
                type="text"
                placeholder="@handle or email"
                className="mt-1 w-full rounded-xl border-2 border-[#0a0a0a] p-2.5 text-xs font-bold shadow-[2px_2px_0_0_#0a0a0a]"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase text-[#0a0a0a]">Message</label>
              <textarea
                rows={4}
                placeholder="How can we help you buzz smoother?"
                className="mt-1 w-full rounded-xl border-2 border-[#0a0a0a] p-2.5 text-xs font-bold shadow-[2px_2px_0_0_#0a0a0a]"
              />
            </div>
            <button
              type="button"
              onClick={() => alert("Thank you! Your feedback has been received.")}
              className="w-full rounded-xl border-2 border-[#0a0a0a] bg-[#0a0a0a] py-3 text-xs font-black uppercase text-white shadow-[2px_2px_0_0_#0a0a0a]"
            >
              Send Support Message
            </button>
          </div>
        </div>
      )}

      <InstallAppDialog open={installOpen} onOpenChange={setInstallOpen} />
    </div>
  );
}
