import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  Globe,
  Lock,
  LockKeyhole,
  Menu,
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
  X,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InstallAppDialog from "@/components/chat/InstallAppDialog";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import { QRCodeSVG } from "qrcode.react";
import BuzzPublicPage, { publicPages } from "./BuzzPublicPage";

const TARGET_LAUNCH_TIMESTAMP = new Date("2027-03-25T10:30:00+05:30").getTime();

/* 1. Sticky Countdown Bar */
const LaunchCountdownBar = ({ onClaim }: { onClaim: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = TARGET_LAUNCH_TIMESTAMP - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isLive: false,
      });
    };
    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sticky top-0 z-[60] w-full border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-2 text-xs font-black shadow-[0_2px_0_0_#0a0a0a]">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-5 w-5 place-items-center rounded border border-[#0a0a0a] bg-white text-[10px]">
            🚀
          </span>
          <span className="tracking-wide text-[#0a0a0a]">
            PUBLIC LAUNCH:{" "}
            <span className="sarvam-gradient-sunset uppercase underline decoration-2">
              25th March 2027 · 10:30 AM IST
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!timeLeft.isLive ? (
            <div className="flex items-center gap-1 font-mono text-[11px] font-black text-[#0a0a0a]">
              <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5">{timeLeft.days}d</span>
              <span>:</span>
              <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5">{String(timeLeft.hours).padStart(2, "0")}h</span>
              <span>:</span>
              <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5">{String(timeLeft.minutes).padStart(2, "0")}m</span>
              <span>:</span>
              <span className="rounded border border-[#0a0a0a] bg-[#FCE314] px-1.5 py-0.5">{String(timeLeft.seconds).padStart(2, "0")}s</span>
            </div>
          ) : (
            <span className="rounded border border-[#0a0a0a] bg-emerald-300 px-2 py-0.5 text-[10px] uppercase">
              🎉 Buzz is Officially Live!
            </span>
          )}

          <button
            onClick={onClaim}
            className="rounded border-2 border-[#0a0a0a] bg-[#0a0a0a] px-2.5 py-1 text-[11px] font-black text-white hover:bg-white hover:text-[#0a0a0a] transition"
          >
            Claim Username ›
          </button>
        </div>
      </div>
    </div>
  );
};

/* 2. Marquee Ticker */
const MarqueeTicker = () => {
  const items = [
    "🇮🇳 100% INDIAN DATA SOVEREIGNTY",
    "🛡️ SHIELD YOUR BANK ACCOUNT & UPI",
    "🤫 GUEST CHAT & GHOST VOICE",
    "⚡ UNDER 5MB LIGHTWEIGHT PWA",
    "🔒 ZERO CONTACT BOOK SCRAPING",
    "📞 DIRECT P2P WEBRTC HD CALLING",
    "✨ 7 CURATED WALLPAPER CHAT THEMES",
  ];

  return (
    <div className="overflow-hidden border-b-2 border-[#0a0a0a] bg-[#0a0a0a] py-2 text-white">
      <div className="flex w-max animate-marquee space-x-8 text-xs font-black tracking-widest uppercase">
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="flex items-center gap-3">
            <span className="sarvam-gradient-spectrum">{item}</span>
            <span className="text-[#FCE314]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* 3. Hero Chat Mockup */
const HeroChatPreview = () => (
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="bz-card max-w-lg mx-auto overflow-hidden p-0 shadow-[0_12px_0_0_#0a0a0a] bg-white text-left"
  >
    <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <img
          src={buzzLogo}
          alt="Buzz Logo"
          className="h-9 w-9 rounded-xl border-2 border-[#0a0a0a] object-cover shadow-[0_2px_0_0_#0a0a0a]"
        />
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-black text-[#0a0a0a]">Kabir Sharma</p>
            <span className="rounded bg-black px-1 py-0.2 text-[9px] font-mono font-bold text-[#FCE314]">
              @kabir
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-800 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            E2EE SECURE
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="grid h-8 w-8 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a]">
          <Phone className="h-4 w-4" />
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a]">
          <Video className="h-4 w-4" />
        </span>
      </div>
    </div>

    <div className="space-y-3 bz-grid-paper p-4 text-xs font-medium bg-[#fffdf5]">
      <div className="w-fit max-w-[80%] rounded-xl border-2 border-[#0a0a0a] bg-white p-3 shadow-[0_3px_0_0_#0a0a0a]">
        Bhai apna mobile number mat do group pe! Direct Buzz username share karo 🛡️
      </div>

      <div className="ml-auto w-fit max-w-[80%] rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] p-3 text-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a]">
        Haan! Mera handle <span className="font-black">@kabir</span> hai. Zero number leaks!
        <div className="mt-1 flex justify-end font-mono text-[9px] font-bold">
          14:32 <CheckCheck className="ml-1 inline h-3 w-3 text-blue-800" />
        </div>
      </div>

      <div className="w-fit max-w-[80%] rounded-xl border-2 border-[#0a0a0a] bg-[#DCF4E4] p-3 shadow-[0_3px_0_0_#0a0a0a] flex items-center gap-2.5">
        <span className="text-lg">🤫</span>
        <div className="flex-1">
          <p className="font-black text-[#0a0a0a]">Guest Confession Note</p>
          <p className="text-[10px] text-emerald-950 font-medium">Bina login kiye kisi dost ne audio bheja!</p>
        </div>
        <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5 text-[9px] font-mono font-bold">
          Ghost Voice
        </span>
      </div>
    </div>

    <div className="flex items-center gap-2 border-t-2 border-[#0a0a0a] bg-[#fffbec] p-3 text-xs text-[#0a0a0a]/70">
      <MessageCircle className="h-4 w-4 text-[#0a0a0a]" />
      <span className="flex-1 font-semibold text-[#0a0a0a]/50">Type without sharing phone number...</span>
      <Mic className="h-4 w-4 text-[#0a0a0a]" />
    </div>
  </motion.div>
);

/* FAQ Accordion Card */
const FaqCard = ({ q, a, accentGradient = "sarvam-gradient-ocean" }: { q: string; a: string; accentGradient?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bz-card overflow-hidden bg-white p-0 shadow-[0_4px_0_0_#0a0a0a] transition-all text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-black text-[#0a0a0a] hover:bg-[#fffbec]"
      >
        <span className="flex-1">
          <span className={accentGradient}>{q}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-[#0a0a0a] bg-[#fffdf5] px-5 py-4 text-xs font-medium leading-relaxed text-[#5b5b55]"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function BuzzLanding() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const rotatingWords = ["Phone Numbers", "Aadhaar Linking", "SIM Swaps", "Spam Calls", "Data Surveillance"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const path = window.location.pathname;
  const cleanPath = path.replace("/", "");
  const isPublicSubpage = publicPages.includes(cleanPath as any);

  const openAuth = () => navigate("/auth");

  return (
    <div id="top" className="min-h-screen bz-grid-paper text-[#0a0a0a]">
      {/* 1. ANNOUNCEMENT & MARQUEE */}
      <LaunchCountdownBar onClaim={openAuth} />
      <MarqueeTicker />

      {/* 2. MAIN HEADER */}
      <header className="sticky top-11 z-50 border-b-2 border-[#0a0a0a] bg-[#fffbec]/95 backdrop-blur px-4 sm:px-6">
        <div className="mx-auto flex h-[68px] sm:h-[72px] max-w-[1160px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <img
                src={buzzLogo}
                alt="Buzz"
                className="h-10 w-10 rounded-xl border-2 border-[#0a0a0a] object-cover shadow-[0_2px_0_0_#0a0a0a]"
              />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#0a0a0a] bg-[#FCE314] text-[8px] font-black">
                🇮🇳
              </span>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#0a0a0a]">
                buzz<span className="text-[#e11d48]">.</span>
              </span>
              <span className="hidden sm:block text-[9px] font-mono font-bold tracking-widest text-[#5b5b55] uppercase">
                WITHOUT DIGITS
              </span>
            </div>
          </Link>

          {/* In-page Anchor Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
            <a href="#features" className="hover:text-purple-600 transition-colors">Features</a>
            <a href="#guest-chat" className="hover:text-purple-600 transition-colors">Guest Chat</a>
            <a href="#security" className="hover:text-purple-600 transition-colors">Security</a>
            <a href="#compare" className="hover:text-purple-600 transition-colors">Compare</a>
            <a href="#india" className="hover:text-purple-600 transition-colors">Made in India 🇮🇳</a>
            <a href="#web" className="hover:text-purple-600 transition-colors">Buzz Web</a>
            <a href="#download" className="hover:text-purple-600 transition-colors">Download</a>
            <Link to="/contact" className="hover:text-purple-600 transition-colors">Contact</Link>
          </nav>

          <div className="hidden sm:flex items-center gap-2.5">
            <InstallAppDialog
              trigger={
                <button className="bz-btn bz-btn-white px-3.5 py-2 text-xs font-bold">
                  <ArrowDownToLine className="h-3.5 w-3.5 mr-1 inline" /> Install
                </button>
              }
            />
            <button
              onClick={openAuth}
              className="bz-btn bz-btn-yellow px-4 py-2 text-xs font-black tracking-wide"
            >
              Log In / Claim ›
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a]"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t-2 border-[#0a0a0a] bg-[#FFF6B8] mt-3 py-4 px-4 flex flex-col gap-3 text-xs font-black uppercase text-left"
            >
              <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#guest-chat" onClick={() => setMenuOpen(false)}>Guest Chat</a>
              <a href="#security" onClick={() => setMenuOpen(false)}>Security</a>
              <a href="#compare" onClick={() => setMenuOpen(false)}>Compare</a>
              <a href="#india" onClick={() => setMenuOpen(false)}>Made in India 🇮🇳</a>
              <a href="#web" onClick={() => setMenuOpen(false)}>Buzz Web</a>
              <a href="#download" onClick={() => setMenuOpen(false)}>Download</a>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>

              <div className="pt-2 flex flex-col gap-2">
                <button onClick={openAuth} className="bz-btn bz-btn-ink w-full py-2.5 text-xs font-black">
                  Claim Username / Log In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. MAIN CONTENT */}
      <main>
        {isPublicSubpage ? (
          <BuzzPublicPage page={cleanPath as any} onLogin={openAuth} />
        ) : (
          <>
            {/* HERO SECTION */}
            <section className="relative px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b-2 border-[#0a0a0a] bz-grid-paper text-center">
              <div className="mx-auto max-w-[960px]">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#0a0a0a] bg-white px-3.5 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a] mb-6"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="sarvam-gradient-sunset font-black">No Phone Numbers Required</span>
                  <span className="text-black/30">·</span>
                  <span className="sarvam-gradient-spectrum font-black">Atmanirbhar Bharat 🇮🇳</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-extrabold text-3xl sm:text-5xl md:text-7xl leading-[1.08] tracking-tight text-[#0a0a0a]"
                >
                  <span className="sarvam-gradient-sunset">Number sirf Bank & UPI tak rakhein.</span>
                  <br />
                  <span className="sarvam-gradient-berry">WhatsApp, Telegram par leak mat karo.</span>
                  <br />
                  <span className="sarvam-gradient-spectrum">Chatting ke liye Buzz.</span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg font-medium text-[#5b5b55] leading-relaxed"
                >
                  <span className="sarvam-gradient-ocean font-bold">WhatsApp number mangta hai, Buzz nahi.</span> Zero digits, zero spam calls. Designed without{" "}
                  <span className="inline-block rounded-md border border-[#0a0a0a] bg-[#FFF6B8] px-2 py-0.5 font-bold text-[#0a0a0a]">
                    {rotatingWords[wordIndex]}
                  </span>
                  . Connect with unique @handles, Ghost Voice filters, and complete privacy.
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-3"
                >
                  <button onClick={openAuth} className="bz-btn bz-btn-yellow px-6 sm:px-8 py-3.5 text-sm sm:text-base font-black">
                    Claim Username (@handle) <ArrowRight className="h-4 w-4 ml-1 inline" />
                  </button>
                  <InstallAppDialog
                    trigger={
                      <button className="bz-btn bz-btn-white px-5 sm:px-6 py-3.5 text-sm sm:text-base font-bold">
                        <ArrowDownToLine className="h-4 w-4 mr-1 inline" /> Get Buzz App
                      </button>
                    }
                  />
                  <a href="#guest-chat" className="bz-btn bz-btn-white px-5 py-3.5 text-sm sm:text-base font-bold">
                    Try Guest Mode 🤫
                  </a>
                </motion.div>
              </div>

              <div className="mt-12 max-w-lg mx-auto">
                <HeroChatPreview />
              </div>
            </section>

            {/* SECTION 1: 100+ FEATURES SHOWCASE */}
            <section id="features" className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a] mb-3">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="sarvam-gradient-spectrum">100+ FEATURES UNLOCKED</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    Stay Close. <span className="sarvam-gradient-sunset">Your Rules.</span>
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#5b5b55]">
                    Zero phone number leaks, zero contact book scraping, and military-grade privacy.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-white">
                    <h3 className="text-base font-black text-[#0a0a0a] mb-4 border-b-2 border-[#0a0a0a]/15 pb-2">
                      <span className="sarvam-gradient-emerald">🛡️ Privacy & Identity</span>
                    </h3>
                    <ul className="space-y-2.5 text-xs font-medium text-[#0a0a0a]">
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Zero Phone Numbers: Connect solely via unique @username</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Guest Mode Secret Links: confession-chat without account</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Ghost Voice: 4 Web Audio filters (Robot, Demon, Chipmunk)</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>End-to-end encrypted 1-on-1 conversations</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Biometric & PIN App Lock with 2-step verification</span></li>
                    </ul>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-white">
                    <h3 className="text-base font-black text-[#0a0a0a] mb-4 border-b-2 border-[#0a0a0a]/15 pb-2">
                      <span className="sarvam-gradient-sunset">⚡ Messaging & Content</span>
                    </h3>
                    <ul className="space-y-2.5 text-xs font-medium text-[#0a0a0a]">
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>24-Hour Moments with live view counters</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>7 Curated Chat Themes with persistent wallpapers</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Direct & Group message forwarding with single dialog</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Instant multi-device browser sync via PWA</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Voice messages with in-browser waveform compression</span></li>
                    </ul>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-white">
                    <h3 className="text-base font-black text-[#0a0a0a] mb-4 border-b-2 border-[#0a0a0a]/15 pb-2">
                      <span className="sarvam-gradient-ocean">📞 Realtime Calls & Discovery</span>
                    </h3>
                    <ul className="space-y-2.5 text-xs font-medium text-[#0a0a0a]">
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Low-latency P2P WebRTC HD Voice and Video calling</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Network-aware Ringing (Online) vs Calling (Offline) states</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Group calls with multi-party audio/video mixing</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Discovery via username search & personal QR code scan</span></li>
                      <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Automated ephemeral cleanup preserving account data</span></li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* SECTION 2: GUEST CHAT & 4 GHOST VOICE FILTERS */}
            <section id="guest-chat" className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-[#fffbec] text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3 py-1 text-xs font-black text-emerald-900 shadow-[0_2px_0_0_#0a0a0a] mb-3">
                    🤫 <span className="sarvam-gradient-berry">SECRET ANONYMOUS CHAT</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    Secret Confessions. <span className="sarvam-gradient-berry">Zero Login Required.</span>
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#5b5b55]">
                    Every Buzz user gets a permanent personal link: <code className="bg-[#FFF6B8] px-2 py-0.5 rounded font-black border border-[#0a0a0a]">buzz.app/c/@yourname</code>. Anyone can send secret confessions and ghost voice notes!
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bz-card p-5 bg-[#FFF6B8] shadow-[0_4px_0_0_#0a0a0a]">
                    <span className="text-2xl">🐿️</span>
                    <h4 className="mt-2 text-sm font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-sunset">Chipmunk Filter</span>
                    </h4>
                    <p className="mt-1 text-xs text-[#0a0a0a]/80">Playful high-pitch voice disguise for fun and funny anonymous banter.</p>
                  </div>
                  <div className="bz-card p-5 bg-[#E2ECFF] shadow-[0_4px_0_0_#0a0a0a]">
                    <span className="text-2xl">🤖</span>
                    <h4 className="mt-2 text-sm font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-ocean">Cyborg Robot</span>
                    </h4>
                    <p className="mt-1 text-xs text-[#0a0a0a]/80">Metallic ring modulation giving futuristic anonymous robotic tone.</p>
                  </div>
                  <div className="bz-card p-5 bg-[#FFE0EB] shadow-[0_4px_0_0_#0a0a0a]">
                    <span className="text-2xl">😈</span>
                    <h4 className="mt-2 text-sm font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-berry">Deep Demon</span>
                    </h4>
                    <p className="mt-1 text-xs text-[#0a0a0a]/80">Sub-bass low pitch shifting for unrecognizable deep confession voice notes.</p>
                  </div>
                  <div className="bz-card p-5 bg-[#DCF4E4] shadow-[0_4px_0_0_#0a0a0a]">
                    <span className="text-2xl">🌌</span>
                    <h4 className="mt-2 text-sm font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-emerald">Cosmic Echo</span>
                    </h4>
                    <p className="mt-1 text-xs text-[#0a0a0a]/80">Spatial reverberation for mysterious atmospheric confessions.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: BANK-GRADE SECURITY & RLS */}
            <section id="security" className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3 py-1 text-xs font-black text-emerald-900 shadow-[0_2px_0_0_#0a0a0a] mb-3">
                    🔒 <span className="sarvam-gradient-emerald">ROW-LEVEL SECURITY (RLS)</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    Cryptographic <span className="sarvam-gradient-emerald">Data Isolation</span>
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#5b5b55]">
                    Your chats, media files, and calls are strictly gated by database-level policies.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="bz-card p-6 bg-white shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FFF6B8] mb-4">
                      <LockKeyhole className="h-6 w-6 text-[#0a0a0a]" />
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-sunset">0 Address Book Scraping</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      Buzz never asks for permission to read, scan, or upload your private contact list to third-party ad servers.
                    </p>
                  </div>

                  <div className="bz-card p-6 bg-white shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#E2ECFF] mb-4">
                      <Shield className="h-6 w-6 text-[#0a0a0a]" />
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-ocean">P2P WebRTC HD Calling</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      Audio and video streams connect directly browser-to-browser with peer-to-peer encryption and zero server recording.
                    </p>
                  </div>

                  <div className="bz-card p-6 bg-white shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#DCF4E4] mb-4">
                      <Sparkles className="h-6 w-6 text-emerald-800" />
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-emerald">Ephemeral Auto-Cleanup</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      24-hour Moments and expired guest messages vanish automatically to keep your digital storage footprint lightweight.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: COMPARISON MATRIX */}
            <section id="compare" className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-[#fffbec] text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="bz-label">
                    <span className="sarvam-gradient-spectrum">HONEST BREAKDOWN</span>
                  </span>
                  <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    How Buzz Compares to <span className="sarvam-gradient-berry">Legacy Messengers</span>
                  </h2>
                </div>

                <div className="bz-card p-6 md:p-8 bg-white shadow-[0_8px_0_0_#0a0a0a] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-[#0a0a0a] bg-[#fffbec]">
                        <th className="p-3 font-black">Security & Feature Standard</th>
                        <th className="p-3 font-black text-[#0a0a0a] bg-[#FFF6B8]">
                          <span className="sarvam-gradient-spectrum">Buzz Messaging 🇮🇳</span>
                        </th>
                        <th className="p-3 font-black text-[#5b5b55]">WhatsApp</th>
                        <th className="p-3 font-black text-[#5b5b55]">Telegram</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-b-2 border-[#0a0a0a]">
                      <tr>
                        <td className="p-3 font-bold">Mandatory Mobile Number?</td>
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
                        <td className="p-3 font-bold">Ghost Voice Pitch Modulators?</td>
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
                        <td className="p-3 font-bold">Uploads Entire Address Book?</td>
                        <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">NEVER (Zero Scraping)</td>
                        <td className="p-3 text-red-600 font-bold">YES (Mandatory sync)</td>
                        <td className="p-3 text-red-600 font-bold">YES (Sync prompt)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* SECTION 5: INDEPENDENT BUZZ WEB */}
            <section id="web" className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#E2ECFF] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a] mb-3">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="sarvam-gradient-ocean">BROWSER MESSAGING</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    Buzz on your <span className="sarvam-gradient-ocean">Big Screen</span>
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#5b5b55]">
                    Independent browser messaging with zero phone tethering.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-white">
                    <h3 className="font-black text-base text-[#0a0a0a] mb-2">
                      <span className="sarvam-gradient-sunset">⚡ Keyboard Productivity</span>
                    </h3>
                    <p className="text-xs text-[#5b5b55] leading-relaxed">
                      Enter to send, Shift+Enter for new lines, smooth momentum scrolling, and instant handle search.
                    </p>
                  </div>
                  <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-white">
                    <h3 className="font-black text-base text-[#0a0a0a] mb-2">
                      <span className="sarvam-gradient-ocean">📹 In-Browser HD Calls</span>
                    </h3>
                    <p className="text-xs text-[#5b5b55] leading-relaxed">
                      WebRTC voice and video calls directly through your laptop's mic and camera without downloading extra software.
                    </p>
                  </div>
                  <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-white">
                    <h3 className="font-black text-base text-[#0a0a0a] mb-2">
                      <span className="sarvam-gradient-berry">🔒 Zero Phone Dependency</span>
                    </h3>
                    <p className="text-xs text-[#5b5b55] leading-relaxed">
                      Unlike WhatsApp Web, Buzz Web runs independently. Your laptop works even if your mobile battery is 0%.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 6: DIGITAL ATMANIRBHAR BHARAT */}
            <section id="india" className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-[#fffbec] text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3 py-1 text-xs font-black text-emerald-900 shadow-[0_2px_0_0_#0a0a0a] mb-2">
                    🇮🇳 DIGITAL ATMANIRBHAR BHARAT
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    Designed in India for <span className="sarvam-gradient-sunset">True Digital Freedom</span>
                  </h2>
                  <p className="mt-3 text-sm text-[#5b5b55] leading-relaxed">
                    Why should 1.4 billion Indians share their mobile numbers with foreign Big Tech servers just to chat with friends and family?
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-[#FFF6B8]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-white mb-4 text-2xl font-black shadow-[0_2px_0_0_#0a0a0a]">
                      🇮🇳
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-sunset">100% Indian Data Sovereignty</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Your identity is safe. Built by Indian developers with zero contact-book scraping and zero advertising tracking.
                    </p>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-[#E2ECFF]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-white mb-4 text-2xl font-black shadow-[0_2px_0_0_#0a0a0a]">
                      🛡️
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-emerald">Shield Your Bank & Aadhaar</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Your phone number links to bank accounts and UPI. Buzz keeps your daily chatting identity completely isolated.
                    </p>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-[#DCF4E4]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-white mb-4 text-2xl font-black shadow-[0_2px_0_0_#0a0a0a]">
                      ⚡
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-ocean">Fast, Lightweight PWA</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Runs fast on 4G and 5G networks across India with no bulky 100MB downloads. Installs in under 3 seconds.
                    </p>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* SECTION 7: DOWNLOAD & QR CODE */}
            <section id="download" className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a] mb-4">
                      <Smartphone className="h-3.5 w-3.5" />
                      <span className="sarvam-gradient-sunset">PWA FOR ALL PLATFORMS</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-[#0a0a0a] leading-[1.05] tracking-tight">
                      Buzz on every <span className="sarvam-gradient-sunset">single device.</span>
                    </h2>
                    <p className="mt-4 text-sm sm:text-base text-[#5b5b55] font-medium leading-relaxed">
                      Install Buzz directly from your browser. Ultra-lightweight (under 5MB), instant updates, and zero Play Store tracking.
                    </p>
                    <div className="mt-8 flex gap-3">
                      <InstallAppDialog
                        trigger={
                          <button className="bz-btn bz-btn-yellow px-7 py-3.5 text-sm font-black">
                            <ArrowDownToLine className="h-4 w-4 mr-1 inline" /> Install Buzz Now
                          </button>
                        }
                      />
                      <button onClick={openAuth} className="bz-btn bz-btn-white px-6 py-3.5 text-sm font-bold">
                        Open in Browser
                      </button>
                    </div>
                  </div>

                  <div className="bz-card p-6 text-center max-w-md mx-auto shadow-[0_8px_0_0_#0a0a0a] bg-white">
                    <h3 className="text-sm font-black text-[#0a0a0a] mb-2">
                      <span className="sarvam-gradient-spectrum">Scan with Phone to Install</span>
                    </h3>
                    <div className="inline-block rounded-2xl border-2 border-[#0a0a0a] bg-white p-4 shadow-[0_4px_0_0_#0a0a0a]">
                      <QRCodeSVG value="https://chat-without-digits.lovable.app" size={160} level="H" />
                    </div>
                    <p className="mt-3 text-[11px] font-mono font-bold text-[#5b5b55]">
                      https://chat-without-digits.lovable.app
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 8: FAQS */}
            <section className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-[#fffbec]">
              <div className="mx-auto max-w-3xl space-y-4">
                <div className="text-center mb-8">
                  <span className="bz-label">QUESTIONS & ANSWERS</span>
                  <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0a0a0a]">
                    Frequently Asked <span className="sarvam-gradient-ocean">Questions (FAQs)</span>
                  </h2>
                </div>

                <FaqCard
                  q="Kya Buzz par account banane ke liye mobile number ya OTP chahiye?"
                  a="Bilkul nahi! Aap sirf apna manpasand unique username aur password chunte hain. Koi bhi SIM card, phone number ya OTP ki zaroorat nahi hoti."
                  accentGradient="sarvam-gradient-sunset"
                />
                <FaqCard
                  q="Guest Mode kya hai aur yeh kaise kaam karta hai?"
                  a="Har Buzz user ko ek personal link milta hai: buzz.app/c/@yourname. Jab aap ise Instagram bio ya status par lagate hain, toh koi bhi visitor bina account banaye ya app download kiye aapko secret message aur Ghost Voice notes bhej sakta hai."
                  accentGradient="sarvam-gradient-berry"
                />
                <FaqCard
                  q="Kya Buzz par audio aur video calls bilkul free hain?"
                  a="Haan! Buzz browser-native WebRTC peer-to-peer technology use karta hai, jisse callers ke beech direct low-latency HD voice aur video call hoti hai bina kisi extra charges ke."
                  accentGradient="sarvam-gradient-emerald"
                />
                <FaqCard
                  q="Agar mera phone kho jaye toh kya mera account chala jayega?"
                  a="Nahi! Kyunki Buzz identity aapke username aur password par chalti hai, aap kisi bhi doosre phone, laptop ya cyber cafe browser par khol kar turant wapas login kar sakte hain."
                  accentGradient="sarvam-gradient-ocean"
                />
              </div>
            </section>

            {/* SECTION 9: PRE-FOOTER GRAND CTA (FIXED VISIBILITY) */}
            <section className="px-4 sm:px-6 py-14 sm:py-20 bg-[#FCE314] text-center border-b-2 border-[#0a0a0a]">
              <div className="mx-auto max-w-2xl">
                <h2 className="text-3xl sm:text-5xl font-black text-[#0a0a0a] tracking-tight">
                  <span className="sarvam-gradient-spectrum">
                    Join Digital Atmanirbhar Bharat Movement 🇮🇳
                  </span>
                </h2>
                <p className="mt-4 text-sm sm:text-base font-black text-[#0a0a0a]">
                  Claim your rare @handle today before official public launch on 25th March 2027!
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button onClick={openAuth} className="bz-btn bz-btn-white px-7 py-3.5 text-sm font-black shadow-[0_4px_0_0_#0a0a0a]">
                    Claim Username Free <ArrowRight className="h-4 w-4 ml-1 inline" />
                  </button>
                  <InstallAppDialog
                    trigger={
                      <button className="bz-btn bz-btn-ink px-6 py-3.5 text-sm font-bold shadow-[0_4px_0_0_#0a0a0a]">
                        <ArrowDownToLine className="h-4 w-4 mr-1 inline" /> Install Buzz App
                      </button>
                    }
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t-2 border-[#0a0a0a] bg-[#FFF6B8] py-8 px-4 text-center text-xs font-bold text-[#0a0a0a]">
        <div className="mx-auto max-w-[1160px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026–2027 Buzz Messaging · Made in India 🇮🇳 · Chat Without Digits</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#guest-chat" className="hover:underline">Guest Chat</a>
            <a href="#security" className="hover:underline">Security</a>
            <a href="#compare" className="hover:underline">Compare</a>
            <a href="#india" className="hover:underline">Made in India 🇮🇳</a>
            <a href="#web" className="hover:underline">Buzz Web</a>
            <a href="#download" className="hover:underline">Download</a>
            <Link to="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
