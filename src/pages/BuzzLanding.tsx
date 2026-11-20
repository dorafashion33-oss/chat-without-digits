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
import { Button } from "@/components/ui/button";
import InstallAppDialog from "@/components/chat/InstallAppDialog";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import BuzzPublicPage, { publicPages } from "./BuzzPublicPage";

const TARGET_LAUNCH_TIMESTAMP = new Date("2027-03-25T10:30:00+05:30").getTime();

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
      const now = Date.now();
      const difference = TARGET_LAUNCH_TIMESTAMP - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isLive: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sticky top-0 z-[60] w-full border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-2 text-xs font-black shadow-[0_2px_0_0_#0a0a0a]">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-5 w-5 place-items-center rounded border border-[#0a0a0a] bg-white text-[10px] shadow-[0_1px_0_0_#0a0a0a]">
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
              <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5 shadow-[0_1px_0_0_#0a0a0a]">
                {timeLeft.days}d
              </span>
              <span>:</span>
              <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5 shadow-[0_1px_0_0_#0a0a0a]">
                {String(timeLeft.hours).padStart(2, "0")}h
              </span>
              <span>:</span>
              <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5 shadow-[0_1px_0_0_#0a0a0a]">
                {String(timeLeft.minutes).padStart(2, "0")}m
              </span>
              <span>:</span>
              <span className="rounded border border-[#0a0a0a] bg-[#FCE314] px-1.5 py-0.5 shadow-[0_1px_0_0_#0a0a0a]">
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          ) : (
            <span className="rounded border border-[#0a0a0a] bg-emerald-300 px-2 py-0.5 text-[10px] uppercase">
              🎉 Buzz is Officially Live!
            </span>
          )}

          <button
            onClick={onClaim}
            className="rounded border-2 border-[#0a0a0a] bg-[#0a0a0a] px-2.5 py-1 text-[11px] font-black text-white shadow-[0_2px_0_0_#0a0a0a] transition hover:bg-white hover:text-[#0a0a0a]"
          >
            Claim Username ›
          </button>
        </div>
      </div>
    </div>
  );
};

/* Marquee News Ticker Ribbon */
const MarqueeTicker = () => {
  const tickerItems = [
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
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <span key={idx} className="flex items-center gap-3">
            <span className="sarvam-gradient-spectrum">{item}</span>
            <span className="text-[#FCE314]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* Tactile Interactive Chat Mockup */
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

/* Interactive FAQ Accordion Card */
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
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
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
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <LaunchCountdownBar onClaim={openAuth} />

      {/* 2. TICKER RIBBON */}
      <MarqueeTicker />

      {/* 3. TACTILE EDITORIAL HEADER */}
      <header className="sticky top-11 z-50 border-b-2 border-[#0a0a0a] bg-[#fffbec]/95 backdrop-blur px-4 sm:px-6">
        <div className="mx-auto flex h-[68px] sm:h-[72px] max-w-[1160px] items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <img
                src={buzzLogo}
                alt="Buzz"
                className="h-10 w-10 rounded-xl border-2 border-[#0a0a0a] object-cover shadow-[0_2px_0_0_#0a0a0a] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all"
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
            <Link to="/features" className="hover:text-purple-600 transition-colors">Features</Link>
            <Link to="/guest-chat" className="hover:text-purple-600 transition-colors">Guest Chat</Link>
            <Link to="/security" className="hover:text-purple-600 transition-colors">Security</Link>
            <Link to="/compare" className="hover:text-purple-600 transition-colors">Compare</Link>
            <Link to="/privacy" className="hover:text-purple-600 transition-colors">Privacy</Link>
            <Link to="/buzz-web" className="hover:text-purple-600 transition-colors">Buzz Web</Link>
            <Link to="/download" className="hover:text-purple-600 transition-colors">Download</Link>
            <Link to="/contact" className="hover:text-purple-600 transition-colors">Contact</Link>
          </nav>

          {/* Action CTAs */}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a]"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t-2 border-[#0a0a0a] bg-[#FFF6B8] mt-3 py-4 px-4 flex flex-col gap-3 text-xs font-black uppercase text-left"
            >
              <Link to="/features" onClick={() => setMenuOpen(false)}>Features</Link>
              <Link to="/guest-chat" onClick={() => setMenuOpen(false)}>Guest Chat</Link>
              <Link to="/security" onClick={() => setMenuOpen(false)}>Security</Link>
              <Link to="/compare" onClick={() => setMenuOpen(false)}>Compare</Link>
              <Link to="/privacy" onClick={() => setMenuOpen(false)}>Privacy</Link>
              <Link to="/buzz-web" onClick={() => setMenuOpen(false)}>Buzz Web</Link>
              <Link to="/download" onClick={() => setMenuOpen(false)}>Download</Link>
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

      {/* 4. MAIN ROUTED CONTENT */}
      <main>
        {isPublicSubpage ? (
          <BuzzPublicPage page={cleanPath as any} onLogin={openAuth} />
        ) : (
          <>
            {/* HERO SECTION WITH DYNAMIC GRADIENTS */}
            <section className="relative px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b-2 border-[#0a0a0a] bz-grid-paper text-center">
              <div className="mx-auto max-w-[960px]">
                {/* Atmanirbhar Saffron Pill */}
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

                {/* Challenger Headline with Multi-Color Shifting Gradients */}
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
                  <span className="sarvam-gradient-spectrum bz-squig">Chatting ke liye Buzz.</span>
                </motion.h1>

                {/* Rotating Kinetic Subtitle */}
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
                  <Link to="/guest-chat" className="bz-btn bz-btn-white px-5 py-3.5 text-sm sm:text-base font-bold">
                    Try Guest Mode 🤫
                  </Link>
                </motion.div>
              </div>

              {/* Chat Mockup Under Hero */}
              <div className="mt-12 max-w-lg mx-auto">
                <HeroChatPreview />
              </div>
            </section>

            {/* BENTO GRID: 4 REAL INDIAN PILLARS WITH SARVAM GRADIENTS */}
            <section className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="bz-label">BUZZ CORE ADVANTAGES</span>
                  <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    Designed for Indian <span className="sarvam-gradient-ocean">Daily Realities</span>
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#5b5b55]">
                    <span className="sarvam-gradient-berry font-bold">
                      Why give out your 10-digit phone number to online buyers, college groups, or acquaintances?
                    </span>
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Card 1: Haldi Yellow */}
                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 bg-[#FFF6B8] shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="h-11 w-11 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-xl font-black mb-4 shadow-[0_2px_0_0_#0a0a0a]">
                      🛡️
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-sunset">Shield Your Bank & UPI</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Your phone number links to PhonePe, GPay, Aadhaar and bank accounts. Buzz keeps your daily chatting identity 100% isolated.
                    </p>
                  </motion.div>

                  {/* Card 2: Aakash Sky Blue */}
                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 bg-[#E2ECFF] shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="h-11 w-11 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-xl font-black mb-4 shadow-[0_2px_0_0_#0a0a0a]">
                      🤫
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-berry">Guest Mode & Ghost Voice</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Put your <code className="font-bold">/c/@username</code> link in Instagram bio. Friends can reply anonymously with Chipmunk or Demon voice filters without creating an account!
                    </p>
                  </motion.div>

                  {/* Card 3: Pista Mint */}
                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 bg-[#DCF4E4] shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="h-11 w-11 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-xl font-black mb-4 shadow-[0_2px_0_0_#0a0a0a]">
                      💻
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-emerald">Independent Buzz Web</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      WhatsApp Web requires your phone nearby and charged. Buzz Web works independently on any laptop even if your phone battery is dead.
                    </p>
                  </motion.div>

                  {/* Card 4: Gulabi Peach */}
                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 bg-[#FFE0EB] shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="h-11 w-11 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-xl font-black mb-4 shadow-[0_2px_0_0_#0a0a0a]">
                      📞
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-ocean">24h Moments & HD Calls</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Vanish after 24 hours with live view counters. Direct peer-to-peer WebRTC voice and video calls with zero middleman recording.
                    </p>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* 3-STEP EDITORIAL WORKFLOW WITH SUNSET GRADIENT */}
            <section className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-[#fffbec] text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="bz-label">SIMPLE AS 1-2-3</span>
                  <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    How Buzz Works in <span className="sarvam-gradient-sunset">3 Simple Steps</span>
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="bz-card p-6 bg-white shadow-[0_6px_0_0_#0a0a0a]">
                    <span className="inline-block rounded-lg border-2 border-[#0a0a0a] bg-[#FCE314] px-2.5 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a]">
                      STEP 01
                    </span>
                    <h3 className="mt-4 text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-spectrum">Claim Unique @handle</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      Pick any username and password. No SIM OTP, no Aadhaar number, and no SMS verification required.
                    </p>
                  </div>

                  <div className="bz-card p-6 bg-white shadow-[0_6px_0_0_#0a0a0a]">
                    <span className="inline-block rounded-lg border-2 border-[#0a0a0a] bg-[#E2ECFF] px-2.5 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a]">
                      STEP 02
                    </span>
                    <h3 className="mt-4 text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-berry">Share Link or Scan QR</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      Show your personal QR card in person or post your link on social stories. Friends connect without seeing your mobile digits.
                    </p>
                  </div>

                  <div className="bz-card p-6 bg-white shadow-[0_6px_0_0_#0a0a0a]">
                    <span className="inline-block rounded-lg border-2 border-[#0a0a0a] bg-[#DCF4E4] px-2.5 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a]">
                      STEP 03
                    </span>
                    <h3 className="mt-4 text-base font-black text-[#0a0a0a]">
                      <span className="sarvam-gradient-emerald">Encrypted Chat & Free Calls</span>
                    </h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      Enjoy 1-on-1 encrypted chats, group chats, 7 custom wallpaper themes, and low-latency P2P HD audio/video calling.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* PRESERVED: MADE IN INDIA 🇮🇳 ATMANIRBHAR SECTION */}
            <section id="india" className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
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

            {/* COMPARISON MATRIX TABLE WITH BERRY GRADIENT */}
            <section className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-[#fffbec] text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="bz-label">HONEST COMPARISON</span>
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
                        <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">YES (4 In-Browser Filters)</td>
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
                        <td className="p-3 font-bold">Uploads Full Address Book?</td>
                        <td className="p-3 font-black text-emerald-800 bg-[#FFF6B8]/40">NEVER (Zero Scraping)</td>
                        <td className="p-3 text-red-600 font-bold">YES (Entire book)</td>
                        <td className="p-3 text-red-600 font-bold">YES (Sync prompt)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* BHARTIYA FAQS ACCORDION WITH OCEAN GRADIENT */}
            <section className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-white">
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

            {/* PRE-FOOTER GRAND CTA WITH SPECTRUM GRADIENT */}
            <section className="px-4 sm:px-6 py-14 sm:py-20 bg-[#FCE314] text-center border-b-2 border-[#0a0a0a]">
              <div className="mx-auto max-w-2xl">
                <h2 className="text-3xl sm:text-5xl font-black text-[#0a0a0a] tracking-tight">
                  <span className="sarvam-gradient-spectrum bz-squig">Join Digital Atmanirbhar Bharat Movement 🇮🇳</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base font-bold text-[#0a0a0a]/80">
                  <span className="sarvam-gradient-sunset">
                    Claim your rare @handle today before official public launch on 25th March 2027!
                  </span>
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

      <footer className="border-t-2 border-[#0a0a0a] bg-[#FFF6B8] py-8 px-4 text-center text-xs font-bold text-[#0a0a0a]">
        <div className="mx-auto max-w-[1160px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026–2027 Buzz Messaging · Made in India 🇮🇳 · Chat Without Digits</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/features" className="hover:underline">Features</Link>
            <Link to="/guest-chat" className="hover:underline">Guest Chat</Link>
            <Link to="/security" className="hover:underline">Security</Link>
            <Link to="/compare" className="hover:underline">Compare</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/buzz-web" className="hover:underline">Buzz Web</Link>
            <Link to="/download" className="hover:underline">Download</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
