import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCheck,
  Globe,
  KeyRound,
  Lock,
  LockKeyhole,
  MessageCircle,
  Mic,
  Phone,
  QrCode,
  Send,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Video,
  Volume2,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import InstallAppDialog from "@/components/chat/InstallAppDialog";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import { QRCodeSVG } from "qrcode.react";

type PublicPage = "features" | "privacy" | "buzz-web" | "download" | "contact";
export const publicPages: PublicPage[] = ["features", "privacy", "buzz-web", "download", "contact"];

/* Tactile Chat Preview with Micro-Animations */
const PreviewCard = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35 }}
    className="bz-card max-w-md mx-auto overflow-hidden p-0 shadow-[0_8px_0_0_#0a0a0a]"
  >
    <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <img
          src={buzzLogo}
          alt="Buzz"
          className="h-8 w-8 rounded-lg border-2 border-[#0a0a0a] object-cover shadow-[0_2px_0_0_#0a0a0a]"
        />
        <div>
          <p className="text-xs font-black text-[#0a0a0a]">Ayesha Sharma</p>
          <span className="text-[10px] font-mono font-bold text-emerald-800 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> ONLINE
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a]">
          <Phone className="h-3.5 w-3.5" />
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a]">
          <Video className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>

    <div className="space-y-3 bz-grid-paper p-4 text-xs font-medium">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-fit max-w-[80%] rounded-xl border-2 border-[#0a0a0a] bg-white p-2.5 shadow-[0_2px_0_0_#0a0a0a]"
      >
        Hey! Are we meeting this evening? ☕
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="ml-auto w-fit max-w-[80%] rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] p-2.5 text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
      >
        Yes, see you at 6! Bringing everyone along 😊
        <div className="mt-1 flex justify-end font-mono text-[9px] font-bold">
          17:42 <CheckCheck className="ml-1 inline h-3 w-3 text-blue-800" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="w-fit max-w-[80%] rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] p-2.5 shadow-[0_2px_0_0_#0a0a0a] flex items-center gap-2"
      >
        <span>🎤</span>
        <div>
          <span className="font-bold">Ghost Voice Note</span>
          <span className="ml-1 text-[10px] text-purple-900 bg-white/70 px-1 py-0.2 rounded border border-[#0a0a0a]/20">
            Chipmunk
          </span>
        </div>
        <div className="flex items-center gap-0.5 ml-2">
          <span className="h-3 w-0.5 bg-[#0a0a0a] animate-bounce" />
          <span className="h-4 w-0.5 bg-[#0a0a0a] animate-bounce [animation-delay:0.15s]" />
          <span className="h-2 w-0.5 bg-[#0a0a0a] animate-bounce [animation-delay:0.3s]" />
        </div>
      </motion.div>
    </div>

    <div className="flex items-center gap-2 border-t-2 border-[#0a0a0a] bg-[#fffbec] p-3 text-xs text-[#0a0a0a]/60">
      <MessageCircle className="h-4 w-4" />
      <span className="flex-1 font-semibold">Message @ayesha...</span>
      <Mic className="h-4 w-4 text-[#0a0a0a]" />
    </div>
  </motion.div>
);

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

  /* ────────── 1. FEATURES PAGE ────────── */
  if (page === "features") {
    const categories = [
      {
        title: "🛡️ Privacy & Identity",
        items: [
          "Zero Phone Numbers: Connect solely via unique @username",
          "Guest Mode Secret Links: anyone can confession-chat without an account",
          "Ghost Voice: In-browser Web Audio filters (Robot, Demon, Chipmunk, Deep)",
          "End-to-end encrypted 1-on-1 conversations",
          "Biometric & PIN App Lock with 2-step verification",
        ],
      },
      {
        title: "⚡ Messaging & Content",
        items: [
          "24-Hour Moments with live view counters",
          "7 Curated Chat Themes with persistent wallpaper rendering",
          "Direct & Group message forwarding with single dialog",
          "Multi-device instant browser sync via PWA",
          "Voice messages with browser waveform compression",
        ],
      },
      {
        title: "📞 Realtime Calls & Discovery",
        items: [
          "Low-latency P2P WebRTC HD Voice and Video calling",
          "Network-aware Ringing (Online) vs Calling (Offline) states",
          "Group calls with multi-party audio/video mixing",
          "Discovery via username search & personal QR code scan",
          "Automated ephemeral cleanup preserving account data",
        ],
      },
    ];

    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20 space-y-12">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a] mb-4">
              <Zap className="h-3.5 w-3.5" /> 100+ FEATURES UNLOCKED · GUEST MODE INCLUDED 🤫
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-[#0a0a0a] leading-[1.05] tracking-tight">
              Stay close.<br />
              <span className="bz-squig">Your rules.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#5b5b55] font-medium leading-relaxed">
              Buzz combines the immediacy of modern messaging with the privacy of anonymous handles, Guest Mode secret links, and Ghost Voice. No numbers leaked. No contact-book uploads.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={onLogin} className="bz-btn bz-btn-yellow px-6 py-3 text-sm font-black">
                Start Chatting Free <ArrowRight className="h-4 w-4" />
              </button>
              <InstallAppDialog
                trigger={
                  <button className="bz-btn bz-btn-white px-5 py-3 text-sm font-bold">
                    <ArrowDownToLine className="h-4 w-4" /> Install App
                  </button>
                }
              />
            </div>
          </motion.div>
          <PreviewCard />
        </div>

        {/* Guest Mode Highlight Spotlight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="bz-card p-6 md:p-8 bg-[#FFF6B8] border-2 border-[#0a0a0a] shadow-[0_6px_0_0_#0a0a0a]"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0a0a0a] bg-white px-2.5 py-0.5 text-[11px] font-black shadow-[0_1px_0_0_#0a0a0a]">
                <span>🤫 GUEST MODE & GHOST VOICE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0a0a0a]">
                Secret Anonymous Chats Without Login
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[#0a0a0a]/80 leading-relaxed">
                Every Buzz handle gets a personal link (<code className="bg-white px-1.5 py-0.5 rounded font-black border border-[#0a0a0a]">buzz.app/c/@username</code>). Put it on your Instagram bio or WhatsApp story. Anyone can reply with disguised Ghost Voice notes (Chipmunk, Robot, Demon, Deep pitch) without creating an account or downloading an app!
              </p>
            </div>
            <button
              onClick={onLogin}
              className="bz-btn bz-btn-white px-4 py-2.5 text-xs font-black shrink-0 whitespace-nowrap"
            >
              Claim Your Link <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
            </button>
          </div>
        </motion.div>

        {/* Categories Matrix with Tactile Hover Animations */}
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.15 }}
              className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]"
            >
              <h3 className="text-base font-black text-[#0a0a0a] mb-4 border-b-2 border-[#0a0a0a]/15 pb-2">
                {cat.title}
              </h3>
              <ul className="space-y-2.5">
                {cat.items.map((it, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-medium text-[#0a0a0a]">
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  /* ────────── 2. PRIVACY PAGE ────────── */
  if (page === "privacy") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20 space-y-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3 py-1 text-xs font-black text-emerald-900 shadow-[0_2px_0_0_#0a0a0a] mb-4">
              <ShieldCheck className="h-3.5 w-3.5" /> ZERO-PHONE-NUMBER PRIVACY
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-[#0a0a0a] leading-[1.05] tracking-tight">
              Your conversations.<br />
              <span className="bz-squig">100% Private.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#5b5b55] font-medium leading-relaxed">
              Traditional chat apps ask for your phone number, upload your entire contact book, and link you to advertisers. Buzz asks for none of that.
            </p>
            <button onClick={onLogin} className="mt-8 bz-btn bz-btn-yellow px-7 py-3.5 text-sm font-black">
              Open Buzz Account <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
          <PreviewCard />
        </div>

        {/* The 3 Privacy Pillars */}
        <div className="grid gap-6 sm:grid-cols-3">
          <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FFF6B8] mb-4">
              <LockKeyhole className="h-6 w-6 text-[#0a0a0a]" />
            </div>
            <h2 className="text-base font-black text-[#0a0a0a]">No Phone Number Identity</h2>
            <p className="mt-2 text-xs text-[#5b5b55] font-medium leading-relaxed">
              Sign up with just a username and password. You will never receive spam calls, SIM-swap attacks, or phone-linked data leaks.
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#E2ECFF] mb-4">
              <Shield className="h-6 w-6 text-[#0a0a0a]" />
            </div>
            <h2 className="text-base font-black text-[#0a0a0a]">Row-Level Security (RLS)</h2>
            <p className="mt-2 text-xs text-[#5b5b55] font-medium leading-relaxed">
              Messages and push tokens are strictly gated by database-level cryptographic policies. Only you and your chat partner can read your messages.
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#DCF4E4] mb-4">
              <Sparkles className="h-6 w-6 text-emerald-800" />
            </div>
            <h2 className="text-base font-black text-[#0a0a0a]">Ephemeral Secret Chats</h2>
            <p className="mt-2 text-xs text-[#5b5b55] font-medium leading-relaxed">
              Guest chats are tokenized and automatically expire. Moments vanish after 24 hours. Your digital footprint remains clean.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ────────── 3. BUZZ WEB PAGE ────────── */
  if (page === "buzz-web") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20 space-y-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#E2ECFF] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a] mb-4">
              <Globe className="h-3.5 w-3.5" /> BROWSER MESSAGING
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-[#0a0a0a] leading-[1.05] tracking-tight">
              Buzz on your<br />
              <span className="bz-squig">Big Screen.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#5b5b55] font-medium leading-relaxed">
              Send messages, share large media files, make voice/video calls, and manage groups directly in Chrome, Safari, or Edge without linking your phone.
            </p>
            <div className="mt-8 flex gap-3">
              <button onClick={onLogin} className="bz-btn bz-btn-yellow px-7 py-3.5 text-sm font-black">
                Open Buzz Web <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
          <PreviewCard />
        </div>

        {/* Web Features Grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <h3 className="font-black text-sm text-[#0a0a0a]">⚡ Keyboard Productivity</h3>
            <p className="mt-1 text-xs text-[#5b5b55] leading-relaxed">
              Enter to send, Shift+Enter for new lines, smooth momentum scrolling, and instant search.
            </p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <h3 className="font-black text-sm text-[#0a0a0a]">📹 In-Browser HD Calls</h3>
            <p className="mt-1 text-xs text-[#5b5b55] leading-relaxed">
              WebRTC voice and video calls directly through your browser's mic and camera.
            </p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_4px_0_0_#0a0a0a]">
            <h3 className="font-black text-sm text-[#0a0a0a]">🔒 Zero Phone Dependency</h3>
            <p className="mt-1 text-xs text-[#5b5b55] leading-relaxed">
              Unlike other web messengers, Buzz Web runs independently. Your laptop doesn't need a connected phone.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ────────── 4. DOWNLOAD PAGE ────────── */
  if (page === "download") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20 space-y-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a] mb-4">
              <Smartphone className="h-3.5 w-3.5" /> PWA FOR ALL PLATFORMS
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-[#0a0a0a] leading-[1.05] tracking-tight">
              Buzz on every<br />
              <span className="bz-squig">single device.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#5b5b55] font-medium leading-relaxed">
              Install Buzz directly from your browser. Ultra-lightweight (under 5MB), instant updates, and zero Play Store / App Store tracking.
            </p>
            <div className="mt-8 flex gap-3">
              <InstallAppDialog
                trigger={
                  <button className="bz-btn bz-btn-yellow px-7 py-3.5 text-sm font-black">
                    <ArrowDownToLine className="h-4 w-4" /> Install Buzz Now
                  </button>
                }
              />
              <button onClick={onLogin} className="bz-btn bz-btn-white px-6 py-3.5 text-sm font-bold">
                Open in Browser
              </button>
            </div>
          </motion.div>

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

        {/* Installation Steps */}
        <div className="grid gap-6 sm:grid-cols-3">
          <motion.div whileHover={{ y: -4 }} className="bz-card p-5 shadow-[0_4px_0_0_#0a0a0a]">
            <span className="bz-label">ANDROID</span>
            <h4 className="mt-2 text-sm font-black text-[#0a0a0a]">Chrome or Brave</h4>
            <p className="mt-1 text-xs text-[#5b5b55]">
              Tap the 3 dots menu in Chrome, then select <strong>"Install app"</strong> or tap the yellow Install button.
            </p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="bz-card p-5 shadow-[0_4px_0_0_#0a0a0a]">
            <span className="bz-label">APPLE iOS</span>
            <h4 className="mt-2 text-sm font-black text-[#0a0a0a]">Safari on iPhone / iPad</h4>
            <p className="mt-1 text-xs text-[#5b5b55]">
              Open in Safari, tap the <strong>Share</strong> icon, and choose <strong>"Add to Home Screen"</strong>.
            </p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="bz-card p-5 shadow-[0_4px_0_0_#0a0a0a]">
            <span className="bz-label">DESKTOP</span>
            <h4 className="mt-2 text-sm font-black text-[#0a0a0a]">Windows / Mac / Linux</h4>
            <p className="mt-1 text-xs text-[#5b5b55]">
              Click the install icon in your address bar or tap "Install Buzz" for a standalone desktop window.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ────────── 5. CONTACT PAGE ────────── */
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bz-card p-6 md:p-10 shadow-[0_8px_0_0_#0a0a0a]"
      >
        <span className="bz-label">BUZZ SUPPORT</span>
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
      </motion.div>
    </div>
  );
}
