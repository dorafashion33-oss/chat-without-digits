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

const TARGET_LAUNCH_TIMESTAMP = new Date("2027-03-25T10:30:00+05:30").getTime();

/* 1. Sleek Top Launch Countdown Bar */
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
    <div className="sticky top-0 z-[60] w-full border-b-2 border-[#0B192C] bg-[#FFF6B8] px-3 py-2 text-xs font-black shadow-[0_2px_0_0_#0B192C]">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-5 w-5 place-items-center rounded border border-[#0B192C] bg-white text-[10px]">
            🚀
          </span>
          <span className="tracking-wide text-[#0B192C]">
            PUBLIC LAUNCH:{" "}
            <span className="text-[#E85A1C] uppercase underline decoration-2">
              25th March 2027 · 10:30 AM IST
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!timeLeft.isLive ? (
            <div className="flex items-center gap-1 font-mono text-[11px] font-black text-[#0B192C]">
              <span className="rounded border border-[#0B192C] bg-white px-1.5 py-0.5">{timeLeft.days}d</span>
              <span>:</span>
              <span className="rounded border border-[#0B192C] bg-white px-1.5 py-0.5">{String(timeLeft.hours).padStart(2, "0")}h</span>
              <span>:</span>
              <span className="rounded border border-[#0B192C] bg-white px-1.5 py-0.5">{String(timeLeft.minutes).padStart(2, "0")}m</span>
              <span>:</span>
              <span className="rounded border border-[#0B192C] bg-[#FCE314] px-1.5 py-0.5">{String(timeLeft.seconds).padStart(2, "0")}s</span>
            </div>
          ) : (
            <span className="rounded border border-[#0B192C] bg-emerald-300 px-2 py-0.5 text-[10px] uppercase">
              🎉 Buzz is Officially Live!
            </span>
          )}

          <button
            onClick={onClaim}
            className="rounded border-2 border-[#0B192C] bg-[#0B192C] px-2.5 py-1 text-[11px] font-black text-white hover:bg-white hover:text-[#0B192C] transition shadow-[0_2px_0_0_#0B192C]"
          >
            Claim Username ›
          </button>
        </div>
      </div>
    </div>
  );
};

/* 2. Sovereign Security News Ticker */
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
    <div className="overflow-hidden border-b-2 border-[#0B192C] bg-[#0B192C] py-2 text-white">
      <div className="flex w-max animate-marquee space-x-8 text-xs font-black tracking-widest uppercase">
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="flex items-center gap-3">
            <span className="text-[#FAF9F6]">{item}</span>
            <span className="text-[#FCE314]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* 3. Interactive Dual-Space Preview Card (Personal vs Secret Mode) */
const InteractiveSpacePreview = () => {
  const [activeTab, setActiveTab] = useState<"personal" | "secret">("personal");

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bz-card max-w-lg mx-auto overflow-hidden p-0 shadow-[0_12px_0_0_#0B192C] bg-white text-left"
    >
      {/* Space Switcher Tabs (BuzzMessaging style) */}
      <div className="flex border-b-2 border-[#0B192C] bg-[#FAF9F6] text-xs font-black">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex-1 py-2.5 text-center transition-all ${
            activeTab === "personal"
              ? "bg-[#FFF6B8] text-[#0B192C] border-r-2 border-[#0B192C]"
              : "text-[#5b5b55] hover:bg-white border-r-2 border-[#0B192C]"
          }`}
        >
          💬 Personal Space
        </button>
        <button
          onClick={() => setActiveTab("secret")}
          className={`flex-1 py-2.5 text-center transition-all ${
            activeTab === "secret"
              ? "bg-[#DCF4E4] text-[#0B192C]"
              : "text-[#5b5b55] hover:bg-white"
          }`}
        >
          🤫 Secret / Guest Mode
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#0B192C] bg-[#fffbec] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img
            src={buzzLogo}
            alt="Buzz"
            className="h-9 w-9 rounded-xl border-2 border-[#0B192C] object-cover shadow-[0_2px_0_0_#0B192C]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-black text-[#0B192C]">
                {activeTab === "personal" ? "Pooja Sharma" : "Anonymous Guest"}
              </p>
              <span className="rounded bg-[#0B192C] px-1 py-0.2 text-[9px] font-mono font-bold text-[#FCE314]">
                {activeTab === "personal" ? "@pooja" : "SECRET LINK"}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              {activeTab === "personal" ? "E2EE ENCRYPTED" : "ZERO LOGIN REQUIRED"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl border-2 border-[#0B192C] bg-white shadow-[0_2px_0_0_#0B192C]">
            <Phone className="h-4 w-4" />
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-xl border-2 border-[#0B192C] bg-white shadow-[0_2px_0_0_#0B192C]">
            <Video className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Messages Body */}
      <div className="space-y-3 bz-grid-paper p-4 text-xs font-medium bg-[#fffdf5] min-h-[200px]">
        {activeTab === "personal" ? (
          <>
            <div className="w-fit max-w-[80%] rounded-xl border-2 border-[#0B192C] bg-white p-3 shadow-[0_3px_0_0_#0B192C]">
              Phone number mat dena kisi group pe! Mera Buzz handle share karo 🛡️
            </div>
            <div className="ml-auto w-fit max-w-[80%] rounded-xl border-2 border-[#0B192C] bg-[#FCE314] p-3 text-[#0B192C] shadow-[0_3px_0_0_#0B192C]">
              Exactly! Zero spam calls, and bank OTP stays safe.
              <div className="mt-1 flex justify-end font-mono text-[9px] font-bold">
                18:24 <CheckCheck className="ml-1 inline h-3 w-3 text-blue-800" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-fit max-w-[80%] rounded-xl border-2 border-[#0B192C] bg-[#DCF4E4] p-3 shadow-[0_3px_0_0_#0B192C] flex items-center gap-2.5">
              <span className="text-xl">🐿️</span>
              <div className="flex-1">
                <p className="font-black text-[#0B192C]">Ghost Voice Confession</p>
                <p className="text-[10px] text-emerald-950">Pitch filter: Chipmunk · 0:11s</p>
              </div>
              <span className="rounded border border-[#0B192C] bg-white px-1.5 py-0.5 text-[9px] font-mono font-bold">
                Audio Note
              </span>
            </div>
            <div className="w-fit max-w-[80%] rounded-xl border-2 border-[#0B192C] bg-white p-3 shadow-[0_3px_0_0_#0B192C]">
              Sent via your public link: <span className="font-mono font-bold text-purple-900">buzz.app/c/@pooja</span>
            </div>
          </>
        )}
      </div>

      {/* Input Field */}
      <div className="flex items-center gap-2 border-t-2 border-[#0B192C] bg-[#FAF9F6] p-3 text-xs text-[#0B192C]/70">
        <MessageCircle className="h-4 w-4 text-[#0B192C]" />
        <span className="flex-1 font-semibold text-[#0B192C]/50">
          {activeTab === "personal" ? "Type without sharing phone number..." : "Send anonymous message..."}
        </span>
        <Mic className="h-4 w-4 text-[#0B192C]" />
      </div>
    </motion.div>
  );
};

/* 4. FAQ Card */
const FaqCard = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bz-card overflow-hidden bg-white p-0 shadow-[0_4px_0_0_#0B192C] transition-all text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-black text-[#0B192C] hover:bg-[#fffbec]"
      >
        <span className="flex-1">{q}</span>
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
            className="border-t-2 border-[#0B192C] bg-[#fffdf5] px-5 py-4 text-xs font-medium leading-relaxed text-[#5b5b55]"
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

  const openAuth = () => navigate("/auth");

  return (
    <div id="top" className="min-h-screen bg-[#FAF9F6] bz-grid-paper text-[#0B192C]">
      {/* 1. TOP UTILITY BARS */}
      <LaunchCountdownBar onClaim={openAuth} />
      <MarqueeTicker />

      {/* 2. MODERN EDITORIAL HEADER */}
      <header className="sticky top-11 z-50 border-b-2 border-[#0B192C] bg-[#FAF9F6]/95 backdrop-blur px-4 sm:px-6">
        <div className="mx-auto flex h-[68px] sm:h-[72px] max-w-[1160px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <img
                src={buzzLogo}
                alt="Buzz Logo"
                className="h-10 w-10 rounded-xl border-2 border-[#0B192C] object-cover shadow-[0_2px_0_0_#0B192C] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all"
              />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#0B192C] bg-[#FCE314] text-[8px] font-black">
                🇮🇳
              </span>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#0B192C]">
                buzz<span className="text-[#E85A1C]">.</span>
              </span>
              <span className="hidden sm:block text-[9px] font-mono font-bold tracking-widest text-[#5b5b55] uppercase">
                CHAT WITHOUT DIGITS
              </span>
            </div>
          </Link>

          {/* Clean In-Page Anchor Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-[#0B192C]">
            <a href="#features" className="hover:text-[#E85A1C] transition-colors">Features</a>
            <a href="#spaces" className="hover:text-[#E85A1C] transition-colors">Spaces</a>
            <a href="#guest-chat" className="hover:text-[#E85A1C] transition-colors">Guest Chat</a>
            <a href="#security" className="hover:text-[#E85A1C] transition-colors">Security</a>
            <a href="#compare" className="hover:text-[#E85A1C] transition-colors">Compare</a>
            <a href="#india" className="hover:text-[#E85A1C] transition-colors">Made in India 🇮🇳</a>
            <a href="#download" className="hover:text-[#E85A1C] transition-colors">Download</a>
            <a href="#faq" className="hover:text-[#E85A1C] transition-colors">FAQs</a>
          </nav>

          <div className="hidden sm:flex items-center gap-2.5">
            <InstallAppDialog
              trigger={
                <button className="bz-btn bz-btn-white px-3.5 py-2 text-xs font-bold border-2 border-[#0B192C] shadow-[0_2px_0_0_#0B192C]">
                  <ArrowDownToLine className="h-3.5 w-3.5 mr-1 inline" /> Install
                </button>
              }
            />
            <button
              onClick={openAuth}
              className="bz-btn bg-[#FCE314] text-[#0B192C] border-2 border-[#0B192C] px-4 py-2 text-xs font-black tracking-wide shadow-[0_3px_0_0_#0B192C] hover:bg-white transition"
            >
              Log In / Claim ›
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0B192C] bg-white shadow-[0_2px_0_0_#0B192C]"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t-2 border-[#0B192C] bg-[#FFF6B8] mt-3 py-4 px-4 flex flex-col gap-3 text-xs font-black uppercase text-left"
            >
              <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#spaces" onClick={() => setMenuOpen(false)}>Spaces</a>
              <a href="#guest-chat" onClick={() => setMenuOpen(false)}>Guest Chat</a>
              <a href="#security" onClick={() => setMenuOpen(false)}>Security</a>
              <a href="#compare" onClick={() => setMenuOpen(false)}>Compare</a>
              <a href="#india" onClick={() => setMenuOpen(false)}>Made in India 🇮🇳</a>
              <a href="#download" onClick={() => setMenuOpen(false)}>Download</a>
              <a href="#faq" onClick={() => setMenuOpen(false)}>FAQs</a>

              <div className="pt-2 flex flex-col gap-2">
                <button onClick={openAuth} className="bz-btn bg-[#0B192C] text-white w-full py-2.5 text-xs font-black border-2 border-[#0B192C]">
                  Claim Username / Log In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b-2 border-[#0B192C] text-center">
        <div className="mx-auto max-w-[960px]">
          {/* Sovereign Indian Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#0B192C] bg-white px-3.5 py-1 text-xs font-black shadow-[0_2px_0_0_#0B192C] mb-6"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[#E85A1C]">Zero Mobile Numbers Required</span>
            <span className="text-black/30">·</span>
            <span>Digital Atmanirbhar Bharat 🇮🇳</span>
          </motion.div>

          {/* Direct Challenger Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-extrabold text-3xl sm:text-5xl md:text-7xl leading-[1.08] tracking-tight text-[#0B192C]"
          >
            <span className="text-[#E85A1C]">Number sirf Bank & UPI tak rakhein.</span>
            <br />
            <span>WhatsApp, Telegram par leak mat karo.</span>
            <br />
            <span className="bg-[#FFF6B8] px-3 py-0.5 rounded-lg border-2 border-[#0B192C] shadow-[0_4px_0_0_#0B192C] inline-block mt-2">
              Chatting ke liye Buzz.
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg font-medium text-[#5b5b55] leading-relaxed"
          >
            <strong className="text-[#0B192C]">WhatsApp number mangta hai, Buzz nahi.</strong> Connect with unique @handles, secret guest links, and Ghost Voice pitch filters. Designed without{" "}
            <span className="inline-block rounded-md border border-[#0B192C] bg-[#FFF6B8] px-2 py-0.5 font-bold text-[#0B192C]">
              {rotatingWords[wordIndex]}
            </span>
            .
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <button onClick={openAuth} className="bz-btn bg-[#FCE314] text-[#0B192C] border-2 border-[#0B192C] px-6 sm:px-8 py-3.5 text-sm sm:text-base font-black shadow-[0_4px_0_0_#0B192C] hover:bg-white transition">
              Claim Your Username (@handle) <ArrowRight className="h-4 w-4 ml-1 inline" />
            </button>
            <InstallAppDialog
              trigger={
                <button className="bz-btn bg-white text-[#0B192C] border-2 border-[#0B192C] px-5 sm:px-6 py-3.5 text-sm sm:text-base font-bold shadow-[0_4px_0_0_#0B192C]">
                  <ArrowDownToLine className="h-4 w-4 mr-1 inline" /> Get Buzz App
                </button>
              }
            />
            <a href="#guest-chat" className="bz-btn bg-white text-[#0B192C] border-2 border-[#0B192C] px-5 py-3.5 text-sm sm:text-base font-bold shadow-[0_4px_0_0_#0B192C]">
              Try Guest Mode 🤫
            </a>
          </motion.div>
        </div>

        {/* Dual-Space Mockup */}
        <div className="mt-12 max-w-lg mx-auto">
          <InteractiveSpacePreview />
        </div>
      </section>

      {/* 4. ARATTAI-INSPIRED CORE FEATURES */}
      <section id="features" className="border-b-2 border-[#0B192C] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
        <div className="mx-auto max-w-[1160px]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0B192C] bg-[#FFF6B8] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0B192C] mb-3">
              <Zap className="h-3.5 w-3.5" /> 100+ FEATURES UNLOCKED
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
              Simple, Reliable Messaging. <span className="text-[#E85A1C]">Sovereign Privacy.</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5b5b55]">
              Everything you need for everyday communication without compromising your mobile identity.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0B192C] bg-white border-2 border-[#0B192C]">
              <h3 className="text-base font-black text-[#0B192C] mb-4 border-b-2 border-[#0B192C]/15 pb-2 flex items-center gap-2">
                <span>🛡️</span> Privacy & Identity
              </h3>
              <ul className="space-y-2.5 text-xs font-medium text-[#0B192C]">
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>Zero Phone Numbers:</strong> Connect solely via unique @username</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>Secret Guest Links:</strong> Anyone can confession-chat without account</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>Ghost Voice:</strong> 4 in-browser pitch modulators (Robot, Demon, Chipmunk)</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>End-to-End Encryption:</strong> Strictly gated 1-on-1 chats</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>Biometric & PIN Lock:</strong> In-app privacy protection</span></li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0B192C] bg-white border-2 border-[#0B192C]">
              <h3 className="text-base font-black text-[#0B192C] mb-4 border-b-2 border-[#0B192C]/15 pb-2 flex items-center gap-2">
                <span>⚡</span> Messaging & Content
              </h3>
              <ul className="space-y-2.5 text-xs font-medium text-[#0B192C]">
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>24-Hour Moments:</strong> Disappearing stories with live view counters</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>7 Curated Themes:</strong> Persistent wallpapers across devices</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>Message Forwarding:</strong> Easy destination picking for chats and groups</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>Multi-Device PWA:</strong> Lightweight install under 5MB</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>Voice Messages:</strong> In-browser audio waveform compression</span></li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0B192C] bg-white border-2 border-[#0B192C]">
              <h3 className="text-base font-black text-[#0B192C] mb-4 border-b-2 border-[#0B192C]/15 pb-2 flex items-center gap-2">
                <span>📞</span> Realtime Calling & Discovery
              </h3>
              <ul className="space-y-2.5 text-xs font-medium text-[#0B192C]">
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>P2P WebRTC HD Calls:</strong> Ultra low-latency voice and video calls</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>Network Awareness:</strong> Ringing (online) vs Calling (offline) status</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>Group Calls:</strong> Multi-party audio/video conferencing</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>QR Code Discovery:</strong> Instant search & personal QR card scan</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span><strong>Ephemeral Cleanup:</strong> Automatic garbage collection of expired data</span></li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. BUZZMESSAGING DUAL-SPACE ARCHITECTURE */}
      <section id="spaces" className="border-b-2 border-[#0B192C] px-4 sm:px-6 py-14 sm:py-20 bg-[#fffbec] text-left">
        <div className="mx-auto max-w-[1160px]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="bz-label">MODERN ARCHITECTURE</span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
              One Platform. <span className="text-[#E85A1C]">Two Distinct Spaces.</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5b5b55]">
              Seamlessly switch between personal family conversations and anonymous secret interactions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bz-card p-6 bg-white border-2 border-[#0B192C] shadow-[0_6px_0_0_#0B192C]">
              <div className="inline-block rounded-lg bg-[#FFF6B8] px-3 py-1 text-xs font-black border border-[#0B192C] mb-4">
                SPACE 01: PERSONAL & COMMUNITY
              </div>
              <h3 className="text-xl font-black text-[#0B192C]">Everyday Conversations Without Spam</h3>
              <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                Connect with close friends, family, and interest circles using your chosen @handle. Group chats, broadcast channels, 24-hour Moments, and crystal-clear WebRTC voice calls — with zero contact-book synchronization.
              </p>
            </div>

            <div className="bz-card p-6 bg-[#DCF4E4] border-2 border-[#0B192C] shadow-[0_6px_0_0_#0B192C]">
              <div className="inline-block rounded-lg bg-white px-3 py-1 text-xs font-black border border-[#0B192C] mb-4 text-emerald-900">
                SPACE 02: INCOGNITO & GUEST INBOX
              </div>
              <h3 className="text-xl font-black text-[#0B192C]">Secret Confessions & Creator Links</h3>
              <p className="mt-2 text-xs text-[#0B192C]/80 leading-relaxed font-medium">
                Put your personal link <code className="bg-white px-1.5 py-0.5 rounded font-black border border-[#0B192C]">buzz.app/c/@username</code> on Instagram, X, or WhatsApp. Visitors can confess, ask questions, or send Ghost Voice notes with pitch filters without ever making an account!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GUEST CHAT & 4 GHOST VOICE FILTERS */}
      <section id="guest-chat" className="border-b-2 border-[#0B192C] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
        <div className="mx-auto max-w-[1160px]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0B192C] bg-[#DCF4E4] px-3 py-1 text-xs font-black text-emerald-900 shadow-[0_2px_0_0_#0B192C] mb-3">
              🤫 SECRET ANONYMOUS CHAT
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
              Secret Confessions. <span className="text-[#E85A1C]">4 Ghost Voice Filters.</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5b5b55]">
              Realtime in-browser pitch shifting modulators for completely disguised anonymous audio notes.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bz-card p-5 bg-[#FFF6B8] border-2 border-[#0B192C] shadow-[0_4px_0_0_#0B192C]">
              <span className="text-2xl">🐿️</span>
              <h4 className="mt-2 text-sm font-black text-[#0B192C]">Chipmunk Filter</h4>
              <p className="mt-1 text-xs text-[#0B192C]/80">Playful high-pitch voice disguise for fun banter and laughter.</p>
            </div>
            <div className="bz-card p-5 bg-[#E2ECFF] border-2 border-[#0B192C] shadow-[0_4px_0_0_#0B192C]">
              <span className="text-2xl">🤖</span>
              <h4 className="mt-2 text-sm font-black text-[#0B192C]">Cyborg Robot</h4>
              <p className="mt-1 text-xs text-[#0B192C]/80">Metallic ring modulation giving a futuristic robotic tone.</p>
            </div>
            <div className="bz-card p-5 bg-[#FFE0EB] border-2 border-[#0B192C] shadow-[0_4px_0_0_#0B192C]">
              <span className="text-2xl">😈</span>
              <h4 className="mt-2 text-sm font-black text-[#0B192C]">Deep Demon</h4>
              <p className="mt-1 text-xs text-[#0B192C]/80">Sub-bass low pitch shifting for unrecognizable confession notes.</p>
            </div>
            <div className="bz-card p-5 bg-[#DCF4E4] border-2 border-[#0B192C] shadow-[0_4px_0_0_#0B192C]">
              <span className="text-2xl">🌌</span>
              <h4 className="mt-2 text-sm font-black text-[#0B192C]">Cosmic Echo</h4>
              <p className="mt-1 text-xs text-[#0B192C]/80">Spatial reverberation for mysterious atmospheric notes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ENTERPRISE SECURITY & DATA ISOLATION */}
      <section id="security" className="border-b-2 border-[#0B192C] px-4 sm:px-6 py-14 sm:py-20 bg-[#fffbec] text-left">
        <div className="mx-auto max-w-[1160px]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0B192C] bg-[#DCF4E4] px-3 py-1 text-xs font-black text-emerald-900 shadow-[0_2px_0_0_#0B192C] mb-3">
              🔒 ROW-LEVEL SECURITY (RLS)
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
              Cryptographic <span className="text-[#E85A1C]">Data Isolation</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5b5b55]">
              Every message, push token, and call signal is strictly gated by database-level policies.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="bz-card p-6 bg-white border-2 border-[#0B192C] shadow-[0_6px_0_0_#0B192C]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0B192C] bg-[#FFF6B8] mb-4">
                <LockKeyhole className="h-6 w-6 text-[#0B192C]" />
              </div>
              <h3 className="text-base font-black text-[#0B192C]">0 Address Book Scraping</h3>
              <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                Buzz never requests permission to read or upload your contact list. Your personal contacts stay entirely on your device.
              </p>
            </div>

            <div className="bz-card p-6 bg-white border-2 border-[#0B192C] shadow-[0_6px_0_0_#0B192C]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0B192C] bg-[#E2ECFF] mb-4">
                <Shield className="h-6 w-6 text-[#0B192C]" />
              </div>
              <h3 className="text-base font-black text-[#0B192C]">P2P WebRTC HD Calling</h3>
              <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                Audio and video streams connect directly browser-to-browser with peer-to-peer encryption and zero server recording.
              </p>
            </div>

            <div className="bz-card p-6 bg-white border-2 border-[#0B192C] shadow-[0_6px_0_0_#0B192C]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0B192C] bg-[#DCF4E4] mb-4">
                <Sparkles className="h-6 w-6 text-emerald-800" />
              </div>
              <h3 className="text-base font-black text-[#0B192C]">Ephemeral Auto-Cleanup</h3>
              <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                24-hour Moments and expired guest messages vanish automatically to keep your digital storage footprint lightweight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. HONEST COMPARISON MATRIX */}
      <section id="compare" className="border-b-2 border-[#0B192C] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
        <div className="mx-auto max-w-[1160px]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="bz-label">HONEST COMPARISON</span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
              How Buzz Compares to <span className="text-[#E85A1C]">Legacy Messengers</span>
            </h2>
          </div>

          <div className="bz-card p-6 md:p-8 bg-white border-2 border-[#0B192C] shadow-[0_8px_0_0_#0B192C] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#0B192C] bg-[#fffbec]">
                  <th className="p-3 font-black">Feature / Security Standard</th>
                  <th className="p-3 font-black text-[#0B192C] bg-[#FFF6B8]">Buzz Messaging 🇮🇳</th>
                  <th className="p-3 font-black text-[#5b5b55]">WhatsApp</th>
                  <th className="p-3 font-black text-[#5b5b55]">Telegram</th>
                  <th className="p-3 font-black text-[#5b5b55]">Arattai</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b-2 border-[#0B192C]">
                <tr>
                  <td className="p-3 font-bold">Mandatory Mobile Number?</td>
                  <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">NO (Zero Digits)</td>
                  <td className="p-3 text-red-600 font-bold">YES (Mandatory)</td>
                  <td className="p-3 text-red-600 font-bold">YES (Mandatory)</td>
                  <td className="p-3 text-red-600 font-bold">YES (Mandatory)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Anonymous Guest Chat Links?</td>
                  <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">YES (No login needed)</td>
                  <td className="p-3 text-red-600 font-bold">NO</td>
                  <td className="p-3 text-red-600 font-bold">NO</td>
                  <td className="p-3 text-red-600 font-bold">NO</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Ghost Voice Pitch Modulators?</td>
                  <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">YES (4 In-Browser Filters)</td>
                  <td className="p-3 text-red-600 font-bold">NO</td>
                  <td className="p-3 text-red-600 font-bold">NO</td>
                  <td className="p-3 text-red-600 font-bold">NO</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Web Works Without Phone Battery?</td>
                  <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">YES (100% Independent)</td>
                  <td className="p-3 text-yellow-700 font-bold">Linked multi-device</td>
                  <td className="p-3 text-emerald-800 font-bold">YES</td>
                  <td className="p-3 text-yellow-700 font-bold">Linked client</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Uploads Entire Address Book?</td>
                  <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">NEVER (Zero Scraping)</td>
                  <td className="p-3 text-red-600 font-bold">YES (Entire book)</td>
                  <td className="p-3 text-red-600 font-bold">YES (Sync prompt)</td>
                  <td className="p-3 text-red-600 font-bold">YES (Contact sync)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. DIGITAL ATMANIRBHAR BHARAT */}
      <section id="india" className="border-b-2 border-[#0B192C] px-4 sm:px-6 py-14 sm:py-20 bg-[#FAF9F6] text-left">
        <div className="mx-auto max-w-[1160px]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0B192C] bg-[#DCF4E4] px-3 py-1 text-xs font-black text-emerald-900 shadow-[0_2px_0_0_#0B192C] mb-2">
              🇮🇳 DIGITAL ATMANIRBHAR BHARAT
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
              Designed in India for <span className="text-[#E85A1C]">True Digital Freedom</span>
            </h2>
            <p className="mt-3 text-sm text-[#5b5b55] leading-relaxed">
              Why should 1.4 billion Indians share their mobile numbers with foreign Big Tech servers just to chat with friends and family?
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0B192C] bg-[#FFF6B8] border-2 border-[#0B192C]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0B192C] bg-white mb-4 text-2xl font-black shadow-[0_2px_0_0_#0B192C]">
                🇮🇳
              </div>
              <h3 className="text-base font-black text-[#0B192C]">100% Indian Data Sovereignty</h3>
              <p className="mt-2 text-xs text-[#0B192C]/80 leading-relaxed font-medium">
                Your identity is safe. Built by Indian developers with zero contact-book scraping and zero advertising tracking.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0B192C] bg-[#E2ECFF] border-2 border-[#0B192C]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0B192C] bg-white mb-4 text-2xl font-black shadow-[0_2px_0_0_#0B192C]">
                🛡️
              </div>
              <h3 className="text-base font-black text-[#0B192C]">Shield Your Bank & UPI</h3>
              <p className="mt-2 text-xs text-[#0B192C]/80 leading-relaxed font-medium">
                Your phone number connects to UPI, PhonePe, and Aadhaar. Buzz keeps your daily chatting identity isolated from banking vulnerabilities.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0B192C] bg-[#DCF4E4] border-2 border-[#0B192C]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0B192C] bg-white mb-4 text-2xl font-black shadow-[0_2px_0_0_#0B192C]">
                ⚡
              </div>
              <h3 className="text-base font-black text-[#0B192C]">Lightweight Under 5MB PWA</h3>
              <p className="mt-2 text-xs text-[#0B192C]/80 leading-relaxed font-medium">
                Runs blazing fast on 4G and 5G networks across India with no bulky 100MB Play Store downloads.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 10. DOWNLOAD & QR CODE */}
      <section id="download" className="border-b-2 border-[#0B192C] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
        <div className="mx-auto max-w-[1160px]">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0B192C] bg-[#FFF6B8] px-3 py-1 text-xs font-black shadow-[0_2px_0_0_#0B192C] mb-4">
                <Smartphone className="h-3.5 w-3.5" /> PWA FOR ALL PLATFORMS
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0B192C] leading-[1.05] tracking-tight">
                Buzz on every <span className="text-[#E85A1C]">single device.</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#5b5b55] font-medium leading-relaxed">
                Install Buzz directly from your browser. Instant updates, desktop independence, and zero app store telemetry.
              </p>
              <div className="mt-8 flex gap-3">
                <InstallAppDialog
                  trigger={
                    <button className="bz-btn bg-[#FCE314] text-[#0B192C] border-2 border-[#0B192C] px-7 py-3.5 text-sm font-black shadow-[0_4px_0_0_#0B192C] hover:bg-white transition">
                      <ArrowDownToLine className="h-4 w-4 mr-1 inline" /> Install Buzz Now
                    </button>
                  }
                />
                <button onClick={openAuth} className="bz-btn bg-white text-[#0B192C] border-2 border-[#0B192C] px-6 py-3.5 text-sm font-bold shadow-[0_4px_0_0_#0B192C]">
                  Open in Browser
                </button>
              </div>
            </div>

            <div className="bz-card p-6 text-center max-w-md mx-auto shadow-[0_8px_0_0_#0B192C] bg-white border-2 border-[#0B192C]">
              <h3 className="text-sm font-black text-[#0B192C] mb-2">Scan with Phone to Install</h3>
              <div className="inline-block rounded-2xl border-2 border-[#0B192C] bg-white p-4 shadow-[0_4px_0_0_#0B192C]">
                <QRCodeSVG value="https://chat-without-digits.lovable.app" size={160} level="H" />
              </div>
              <p className="mt-3 text-[11px] font-mono font-bold text-[#5b5b55]">
                https://chat-without-digits.lovable.app
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQS ACCORDION */}
      <section id="faq" className="border-b-2 border-[#0B192C] px-4 sm:px-6 py-14 sm:py-20 bg-[#FAF9F6]">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="text-center mb-8">
            <span className="bz-label">QUESTIONS & ANSWERS</span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0B192C]">
              Frequently Asked <span className="text-[#E85A1C]">Questions (FAQs)</span>
            </h2>
          </div>

          <FaqCard
            q="Kya Buzz par account banane ke liye mobile number ya OTP chahiye?"
            a="Bilkul nahi! Aap sirf apna manpasand unique username aur password chunte hain. Koi bhi SIM card, phone number ya OTP ki zaroorat nahi hoti."
          />
          <FaqCard
            q="Guest Mode kya hai aur yeh kaise kaam karta hai?"
            a="Har Buzz user ko ek personal link milta hai: buzz.app/c/@yourname. Jab aap ise Instagram bio ya social status par lagate hain, toh koi bhi visitor bina account banaye ya app download kiye aapko secret message aur Ghost Voice notes bhej sakta hai."
          />
          <FaqCard
            q="Kya Buzz par audio aur video calls bilkul free hain?"
            a="Haan! Buzz browser-native WebRTC peer-to-peer technology use karta hai, jisse callers ke beech direct low-latency HD voice aur video call hoti hai bina kisi extra charges ke."
          />
          <FaqCard
            q="Agar mera phone kho jaye toh kya mera account chala jayega?"
            a="Nahi! Kyunki Buzz identity aapke username aur password par chalti hai, aap kisi bhi doosre phone, laptop ya cyber cafe browser par khol kar turant wapas login kar sakte hain."
          />
        </div>
      </section>

      {/* 12. PRE-FOOTER GRAND CTA (100% CONTRAST & VISIBILITY) */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-[#FCE314] text-center border-b-2 border-[#0B192C]">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl sm:text-5xl font-black text-[#0B192C] tracking-tight">
            Join Digital Atmanirbhar Bharat Movement 🇮🇳
          </h2>
          <p className="mt-4 text-sm sm:text-base font-black text-[#0B192C]/90">
            Claim your rare @handle today before official public launch on 25th March 2027!
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={openAuth} className="bz-btn bg-white text-[#0B192C] border-2 border-[#0B192C] px-7 py-3.5 text-sm font-black shadow-[0_4px_0_0_#0B192C] hover:bg-[#FAF9F6] transition">
              Claim Username Free <ArrowRight className="h-4 w-4 ml-1 inline" />
            </button>
            <InstallAppDialog
              trigger={
                <button className="bz-btn bg-[#0B192C] text-white border-2 border-[#0B192C] px-6 py-3.5 text-sm font-bold shadow-[0_4px_0_0_#0B192C]">
                  <ArrowDownToLine className="h-4 w-4 mr-1 inline" /> Install Buzz App
                </button>
              }
            />
          </div>
        </div>
      </section>

      {/* 13. FOOTER */}
      <footer className="border-t-2 border-[#0B192C] bg-[#FFF6B8] py-8 px-4 text-center text-xs font-bold text-[#0B192C]">
        <div className="mx-auto max-w-[1160px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026–2027 Buzz Messaging · Made in India 🇮🇳 · Chat Without Digits</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#spaces" className="hover:underline">Spaces</a>
            <a href="#guest-chat" className="hover:underline">Guest Chat</a>
            <a href="#security" className="hover:underline">Security</a>
            <a href="#compare" className="hover:underline">Compare</a>
            <a href="#india" className="hover:underline">Made in India 🇮🇳</a>
            <a href="#download" className="hover:underline">Download</a>
            <a href="#faq" className="hover:underline">FAQs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
