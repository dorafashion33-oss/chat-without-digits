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
    const calculate = () => {
      const now = Date.now();
      const diff = TARGET_LAUNCH_TIMESTAMP - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, isLive: false });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full border-b-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] px-3 py-2 text-center text-xs font-black shadow-sm">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block animate-pulse">🚀</span>
          <span className="uppercase tracking-wider">Public Launch: 25th March 2027 · 10:30 AM IST</span>
        </div>

        <div className="flex items-center gap-2">
          {!timeLeft.isLive ? (
            <div className="flex items-center gap-1 font-mono text-[11px] bg-white px-2 py-0.5 rounded-lg border border-[#0a0a0a] shadow-[0_1px_0_0_#0a0a0a]">
              <span>{timeLeft.days}d</span>:<span>{String(timeLeft.hours).padStart(2, "0")}h</span>:
              <span>{String(timeLeft.minutes).padStart(2, "0")}m</span>:
              <span className="text-red-600">{String(timeLeft.seconds).padStart(2, "0")}s</span>
            </div>
          ) : (
            <span className="rounded-md border border-[#0a0a0a] bg-emerald-300 px-2 py-0.5 font-bold">
              🎉 BUZZ IS OFFICIALLY LIVE!
            </span>
          )}

          <button
            onClick={onClaim}
            className="rounded-lg border-2 border-[#0a0a0a] bg-white px-2.5 py-0.5 text-[11px] font-black hover:bg-[#FFF6B8] transition-colors"
          >
            Claim Username ›
          </button>
        </div>
      </div>
    </div>
  );
};

/* Sarvam-style Infinite Moving Marquee Ticker */
const MarqueeRibbon = () => (
  <div className="w-full overflow-hidden border-b-2 border-[#0a0a0a] bg-white py-2 text-xs font-black text-[#0a0a0a]">
    <div className="bz-marquee-track flex items-center gap-6 whitespace-nowrap">
      <span>🇮🇳 100% INDIAN DATA SOVEREIGNTY</span>
      <span>·</span>
      <span>🛡️ SHIELD YOUR BANK ACCOUNT & UPI</span>
      <span>·</span>
      <span>🤫 GUEST CHAT & GHOST VOICE</span>
      <span>·</span>
      <span>⚡ UNDER 5MB LIGHTWEIGHT PWA</span>
      <span>·</span>
      <span>🔒 ZERO CONTACT BOOK SCRAPING</span>
      <span>·</span>
      <span>🇮🇳 100% INDIAN DATA SOVEREIGNTY</span>
      <span>·</span>
      <span>🛡️ SHIELD YOUR BANK ACCOUNT & UPI</span>
      <span>·</span>
      <span>🤫 GUEST CHAT & GHOST VOICE</span>
      <span>·</span>
      <span>⚡ UNDER 5MB LIGHTWEIGHT PWA</span>
      <span>·</span>
      <span>🔒 ZERO CONTACT BOOK SCRAPING</span>
    </div>
  </div>
);

const Logo = () => (
  <a href="#top" className="flex items-center gap-2.5 group">
    <div className="relative">
      <img
        src={buzzLogo}
        alt="Buzz"
        className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-2 border-[#0a0a0a] object-cover shadow-[0_2px_0_0_#0a0a0a] group-hover:scale-105 transition-transform"
      />
      <span className="absolute -bottom-1 -right-1 text-[11px] leading-none" title="Made in India">
        🇮🇳
      </span>
    </div>
    <div className="flex flex-col text-left">
      <span className="font-extrabold text-xl sm:text-2xl leading-none tracking-tight text-[#0a0a0a]">
        buzz<span className="text-[#FCE314] drop-shadow-[0_1px_0_#0a0a0a]">.</span>
      </span>
      <span className="text-[9px] font-bold font-mono tracking-wider text-[#5b5b55] uppercase">
        Without Digits
      </span>
    </div>
  </a>
);

/* Tactile Chat Preview Mockup */
const HeroChatPreview = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="bz-card max-w-md mx-auto overflow-hidden p-0 shadow-[0_8px_0_0_#0a0a0a] bg-white text-left"
  >
    <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-purple-600 text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a]">
          PS
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-black text-[#0a0a0a]">Priya Sharma</p>
            <span className="text-[10px]">🇮🇳</span>
          </div>
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
      <div className="w-fit max-w-[80%] rounded-xl border-2 border-[#0a0a0a] bg-white p-2.5 shadow-[0_2px_0_0_#0a0a0a]">
        Rahul! Don't share your mobile number in that group, use Buzz handle instead 🛡️
      </div>
      <div className="ml-auto w-fit max-w-[80%] rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] p-2.5 text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]">
        Yes, shared my <span className="font-bold">@rahul_v</span> link. Bank and UPI are completely safe now! 🇮🇳
        <div className="mt-1 flex justify-end font-mono text-[9px] font-bold">
          11:24 <CheckCheck className="ml-1 inline h-3 w-3 text-blue-800" />
        </div>
      </div>
      <div className="w-fit max-w-[80%] rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] p-2.5 shadow-[0_2px_0_0_#0a0a0a] flex items-center gap-2">
        <span>🎤</span>
        <div>
          <span className="font-bold">Ghost Voice Confession</span>
          <span className="ml-1 text-[10px] text-purple-900 bg-white/80 px-1 py-0.2 rounded border border-[#0a0a0a]/20">
            Chipmunk Filter
          </span>
        </div>
        <div className="flex items-center gap-0.5 ml-1">
          <span className="h-3 w-0.5 bg-[#0a0a0a] animate-bounce" />
          <span className="h-4 w-0.5 bg-[#0a0a0a] animate-bounce [animation-delay:0.15s]" />
          <span className="h-2 w-0.5 bg-[#0a0a0a] animate-bounce [animation-delay:0.3s]" />
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 border-t-2 border-[#0a0a0a] bg-[#fffbec] p-3 text-xs text-[#0a0a0a]/60">
      <MessageCircle className="h-4 w-4" />
      <span className="flex-1 font-semibold">Message @priya_sharma...</span>
      <Mic className="h-4 w-4 text-[#0a0a0a]" />
    </div>
  </motion.div>
);

/* Tactile FAQ Accordion */
const FaqCard = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div whileHover={{ y: -2 }} className="bz-card p-4 transition-all bg-white text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-sm font-black text-[#0a0a0a]"
      >
        <span>{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed pt-2 border-t border-[#0a0a0a]/10">{a}</p>}
    </motion.div>
  );
};

export default function BuzzLanding({ page = "/" }: { page?: string }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const openAuth = () => navigate("/auth");

  // Sarvam-style kinetic auto-rotating keywords
  const rotatingWords = [
    "phone numbers",
    "SIM-swap risks",
    "OTP spam calls",
    "UPI bank leaks",
    "contact tracking",
  ];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const cleanPage = page.startsWith("/") ? page.slice(1) : page;
  const isCustomSubPage = publicPages.includes(cleanPage as any);

  return (
    <div id="top" className="min-h-screen bz-grid-paper text-[#0a0a0a]">
      <header className="sticky top-0 z-50 border-b-2 border-[#0a0a0a] bg-[#fffbec]/95 backdrop-blur">
        <LaunchCountdownBar onClaim={openAuth} />

        <div className="mx-auto flex h-[68px] sm:h-[72px] max-w-[1160px] items-center justify-between px-4 sm:px-6">
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            <Link to="/features" className="text-[13px] font-bold text-[#0a0a0a] hover:underline">
              Features
            </Link>
            <Link to="/guest-chat" className="text-[13px] font-bold text-[#0a0a0a] hover:underline flex items-center gap-1">
              Guest Chat <span className="bg-[#FCE314] px-1 py-0.2 rounded text-[10px] font-black border border-[#0a0a0a]">NEW</span>
            </Link>
            <Link to="/security" className="text-[13px] font-bold text-[#0a0a0a] hover:underline">
              Security
            </Link>
            <Link to="/compare" className="text-[13px] font-bold text-[#0a0a0a] hover:underline">
              Compare
            </Link>
            <a href="#india" className="text-[13px] font-bold text-[#0a0a0a] hover:underline flex items-center gap-1">
              Made in India 🇮🇳
            </a>
            <Link to="/privacy" className="text-[13px] font-bold text-[#0a0a0a] hover:underline">
              Privacy
            </Link>
            <Link to="/download" className="text-[13px] font-bold text-[#0a0a0a] hover:underline">
              Download
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openAuth}
              className="bz-btn bz-btn-white hidden px-4 py-2 text-xs sm:inline-flex"
            >
              Log In
            </button>
            <InstallAppDialog
              trigger={
                <button className="bz-btn bz-btn-yellow px-4 sm:px-5 py-2 text-xs sm:text-sm">
                  Get Buzz <ArrowDownToLine className="h-4 w-4" />
                </button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="border-2 border-[#0a0a0a] rounded-xl lg:hidden h-9 w-9"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t-2 border-[#0a0a0a] bg-[#fffbec] p-5 lg:hidden overflow-hidden"
            >
              <nav className="grid gap-2 text-sm" aria-label="Mobile navigation">
                <Link to="/features" onClick={() => setMenuOpen(false)} className="font-bold py-1.5 border-b border-[#0a0a0a]/10">
                  Features & Capabilities
                </Link>
                <Link to="/guest-chat" onClick={() => setMenuOpen(false)} className="font-bold py-1.5 border-b border-[#0a0a0a]/10 flex items-center justify-between">
                  <span>Guest Chat & Ghost Voice</span>
                  <span className="bg-[#FCE314] px-1 py-0.2 rounded text-[10px] font-black border border-[#0a0a0a]">NEW</span>
                </Link>
                <Link to="/security" onClick={() => setMenuOpen(false)} className="font-bold py-1.5 border-b border-[#0a0a0a]/10">
                  Security Architecture (RLS)
                </Link>
                <Link to="/compare" onClick={() => setMenuOpen(false)} className="font-bold py-1.5 border-b border-[#0a0a0a]/10">
                  Buzz vs WhatsApp vs Telegram
                </Link>
                <a href="#india" onClick={() => setMenuOpen(false)} className="font-bold py-1.5 border-b border-[#0a0a0a]/10 flex items-center gap-1">
                  Made in India Story 🇮🇳
                </a>
                <Link to="/privacy" onClick={() => setMenuOpen(false)} className="font-bold py-1.5 border-b border-[#0a0a0a]/10">
                  Privacy Guarantee
                </Link>
                <Link to="/download" onClick={() => setMenuOpen(false)} className="font-bold py-1.5 border-b border-[#0a0a0a]/10">
                  Download & Install
                </Link>
                <div className="pt-3 flex gap-2">
                  <button onClick={openAuth} className="bz-btn bz-btn-white flex-1 py-2.5 text-xs font-black">
                    Log In / Sign Up
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {isCustomSubPage ? (
          <BuzzPublicPage page={cleanPage as any} onLogin={openAuth} />
        ) : (
          <>
            {/* Sarvam Marquee Moving Ribbon */}
            <MarqueeRibbon />

            {/* HERO SECTION: SARVAM KINETIC TEXT + BUZZMESSAGING.AI PAPER */}
            <section className="relative border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 md:py-24 text-center overflow-hidden">
              <div className="mx-auto max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border-2 border-[#0a0a0a] bg-white px-3 sm:px-4 py-1.5 shadow-[0_3px_0_0_#0a0a0a] mb-6 text-xs font-black"
                >
                  <span className="bz-label">BUZZ INDIA</span>
                  <span className="text-black/30">·</span>
                  <span>Zero Digits</span>
                  <span className="text-black/30">·</span>
                  <span>Guest Mode 🤫</span>
                  <span className="text-black/30">·</span>
                  <span>Atmanirbhar Bharat 🇮🇳</span>
                </motion.div>

                {/* Sarvam-style Animated Color-Shifting Gradient Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-extrabold text-3xl sm:text-5xl md:text-7xl leading-[1.08] tracking-tight text-[#0a0a0a]"
                >
                  Apne number ko bank ke liye rakhein.<br />
                  <span className="sarvam-gradient-text bz-squig">Chatting ke liye Buzz.</span>
                </motion.h1>

                {/* Rotating Kinetic Subtitle */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg font-medium text-[#5b5b55] leading-relaxed"
                >
                  India's first privacy-first messenger designed without{" "}
                  <span className="inline-block rounded-md border border-[#0a0a0a] bg-[#FFF6B8] px-2 py-0.5 font-bold text-[#0a0a0a]">
                    {rotatingWords[wordIndex]}
                  </span>
                  . Connect with unique handles, record Ghost Voice notes, and talk with zero surveillance.
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

            {/* BENTO GRID: 4 REAL INDIAN PILLARS (BUZZMESSAGING.AI PASTEL STYLE) */}
            <section className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-white text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="bz-label">BUZZ CORE ADVANTAGES</span>
                  <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    Designed for Indian Daily Realities
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#5b5b55]">
                    Why give out your 10-digit phone number to online buyers, college groups, or acquaintances?
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Card 1: Haldi Yellow */}
                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 bg-[#FFF6B8] shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="h-11 w-11 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-xl font-black mb-4 shadow-[0_2px_0_0_#0a0a0a]">
                      🛡️
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">Shield Your Bank & UPI</h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Your phone number links to PhonePe, GPay, Aadhaar and bank accounts. Buzz keeps your daily chatting identity 100% isolated.
                    </p>
                  </motion.div>

                  {/* Card 2: Aakash Sky Blue */}
                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 bg-[#E2ECFF] shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="h-11 w-11 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-xl font-black mb-4 shadow-[0_2px_0_0_#0a0a0a]">
                      🤫
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">Guest Mode & Ghost Voice</h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Put your <code className="font-bold">/c/@username</code> link in Instagram bio. Friends can reply anonymously with Chipmunk or Demon voice filters without creating an account!
                    </p>
                  </motion.div>

                  {/* Card 3: Pista Mint */}
                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 bg-[#DCF4E4] shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="h-11 w-11 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-xl font-black mb-4 shadow-[0_2px_0_0_#0a0a0a]">
                      💻
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">Independent Buzz Web</h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      WhatsApp Web requires your phone nearby and charged. Buzz Web works independently on any laptop even if your phone battery is dead.
                    </p>
                  </motion.div>

                  {/* Card 4: Gulabi Peach */}
                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 bg-[#FFE0EB] shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="h-11 w-11 grid place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-xl font-black mb-4 shadow-[0_2px_0_0_#0a0a0a]">
                      📞
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">24h Moments & HD Calls</h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Vanish after 24 hours with live view counters. Direct peer-to-peer WebRTC voice and video calls with zero middleman recording.
                    </p>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* 3-STEP EDITORIAL WORKFLOW */}
            <section className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-[#fffbec] text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="bz-label">SIMPLE AS 1-2-3</span>
                  <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    How Buzz Works in 3 Steps
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="bz-card p-6 bg-white shadow-[0_6px_0_0_#0a0a0a]">
                    <span className="inline-block rounded-lg border-2 border-[#0a0a0a] bg-[#FCE314] px-2.5 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a]">
                      STEP 01
                    </span>
                    <h3 className="mt-4 text-base font-black text-[#0a0a0a]">Claim Your Unique @handle</h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      Pick any username and password. No SIM OTP, no Aadhaar number, and no SMS verification required.
                    </p>
                  </div>

                  <div className="bz-card p-6 bg-white shadow-[0_6px_0_0_#0a0a0a]">
                    <span className="inline-block rounded-lg border-2 border-[#0a0a0a] bg-[#E2ECFF] px-2.5 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a]">
                      STEP 02
                    </span>
                    <h3 className="mt-4 text-base font-black text-[#0a0a0a]">Share Link or Scan QR</h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      Show your personal QR card in person or post your link on social stories. Friends connect without seeing your mobile digits.
                    </p>
                  </div>

                  <div className="bz-card p-6 bg-white shadow-[0_6px_0_0_#0a0a0a]">
                    <span className="inline-block rounded-lg border-2 border-[#0a0a0a] bg-[#DCF4E4] px-2.5 py-1 text-xs font-black shadow-[0_2px_0_0_#0a0a0a]">
                      STEP 03
                    </span>
                    <h3 className="mt-4 text-base font-black text-[#0a0a0a]">Encrypted Chat & Free Calls</h3>
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
                    Designed in India for True Digital Freedom
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
                    <h3 className="text-base font-black text-[#0a0a0a]">100% Indian Data Sovereignty</h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Your identity is safe. Built by Indian developers with zero contact-book scraping and zero advertising tracking.
                    </p>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-[#E2ECFF]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-white mb-4 text-2xl font-black shadow-[0_2px_0_0_#0a0a0a]">
                      🛡️
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">Shield Your Bank & Aadhaar</h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Your phone number links to bank accounts and UPI. Buzz keeps your daily chatting identity completely isolated.
                    </p>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a] bg-[#DCF4E4]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-white mb-4 text-2xl font-black shadow-[0_2px_0_0_#0a0a0a]">
                      ⚡
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">Fast, Lightweight PWA</h3>
                    <p className="mt-2 text-xs text-[#0a0a0a]/80 leading-relaxed font-medium">
                      Runs fast on 4G and 5G networks across India with no bulky 100MB downloads. Installs in under 3 seconds.
                    </p>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* COMPARISON MATRIX TABLE */}
            <section className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-[#fffbec] text-left">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="bz-label">HONEST COMPARISON</span>
                  <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    How Buzz Compares to Legacy Messengers
                  </h2>
                </div>

                <div className="bz-card p-6 md:p-8 bg-white shadow-[0_8px_0_0_#0a0a0a] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-[#0a0a0a] bg-[#fffbec]">
                        <th className="p-3 font-black">Security & Feature Standard</th>
                        <th className="p-3 font-black text-[#0a0a0a] bg-[#FFF6B8]">Buzz Messaging 🇮🇳</th>
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

            {/* BHARTIYA FAQS ACCORDION */}
            <section className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-white">
              <div className="mx-auto max-w-3xl space-y-4">
                <div className="text-center mb-8">
                  <span className="bz-label">QUESTIONS & ANSWERS</span>
                  <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0a0a0a]">
                    Frequently Asked Questions
                  </h2>
                </div>

                <FaqCard
                  q="Kya Buzz par account banane ke liye mobile number ya OTP chahiye?"
                  a="Bilkul nahi! Aap sirf apna manpasand unique username aur password chunte hain. Koi bhi SIM card, phone number ya OTP ki zaroorat nahi hoti."
                />
                <FaqCard
                  q="Guest Mode kya hai aur yeh kaise kaam karta hai?"
                  a="Har Buzz user ko ek personal link milta hai: buzzofficial.vercel.app/c/@yourname. Jab aap ise Instagram bio ya status par lagate hain, toh koi bhi visitor bina account banaye ya app download kiye aapko secret message aur Ghost Voice notes bhej sakta hai."
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

            {/* PRE-FOOTER GRAND CTA */}
            <section className="px-4 sm:px-6 py-14 sm:py-20 bg-[#FCE314] text-center border-b-2 border-[#0a0a0a]">
              <div className="mx-auto max-w-2xl">
                <h2 className="text-3xl sm:text-5xl font-black text-[#0a0a0a] tracking-tight">
                  Join Digital Atmanirbhar Bharat Movement 🇮🇳
                </h2>
                <p className="mt-4 text-sm sm:text-base font-bold text-[#0a0a0a]/80">
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

      <footer className="border-t-2 border-[#0a0a0a] bg-[#FFF6B8] py-8 px-4 text-center text-xs font-bold text-[#0a0a0a]">
        <div className="mx-auto max-w-[1160px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026–2027 Buzz Messaging · Made in India 🇮🇳 · Chat Without Digits</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/features" className="hover:underline">Features</Link>
            <Link to="/guest-chat" className="hover:underline">Guest Chat</Link>
            <Link to="/security" className="hover:underline">Security</Link>
            <Link to="/compare" className="hover:underline">Compare</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/buzz-web" className="hover:underline">Buzz Web</Link>
            <Link to="/download" className="hover:underline">Download</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
