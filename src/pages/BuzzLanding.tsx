import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import BuzzPublicPage, { publicPages } from "@/pages/BuzzPublicPage";
import {
  ArrowDownToLine,
  ArrowRight,
  CheckCheck,
  Ellipsis,
  Ghost,
  LockKeyhole,
  Menu,
  MessageCircle,
  Mic,
  Paperclip,
  Phone,
  QrCode,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthPage from "@/pages/AuthPage";
import InstallAppDialog from "@/components/chat/InstallAppDialog";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import heroImage from "@/assets/buzz-hero-user.jpg";
import familyImage from "@/assets/buzz-family-call.jpg";
import groupImage from "@/assets/buzz-group-call.jpg";

type BubbleProps = { name?: string; children: React.ReactNode; own?: boolean; className?: string };

const Bubble = ({ name, children, own, className = "" }: BubbleProps) => (
  <div
    className={`w-fit max-w-[260px] rounded-2xl px-3.5 py-2.5 text-xs font-medium border-2 border-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a] ${
      own ? "ml-auto bg-[#FCE314] text-[#0a0a0a]" : "bg-white text-[#0a0a0a]"
    } ${className}`}
  >
    {name && <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a]/70">{name}</p>}
    <div className="flex items-end gap-2">
      <span className="leading-relaxed">{children}</span>
      <span className="text-[9px] text-[#0a0a0a]/60 whitespace-nowrap">
        11:59 {own && <CheckCheck className="inline h-3 w-3 text-[#0a0a0a]" />}
      </span>
    </div>
  </div>
);

const Logo = ({ light = false }: { light?: boolean }) => (
  <Link to="/" className="flex items-center gap-2.5 font-extrabold" aria-label="Buzz home">
    <span className="relative flex items-center">
      <img
        src={buzzLogo}
        alt="Buzz"
        className="h-10 w-10 rounded-xl border-2 border-[#0a0a0a] object-cover shadow-[0_2px_0_0_#0a0a0a]"
      />
      <span className="absolute -bottom-1 -right-1 text-xs">🇮🇳</span>
    </span>
    <span className={`text-2xl tracking-tight ${light ? "text-white" : "text-[#0a0a0a]"}`}>
      Buzz
    </span>
  </Link>
);

const ScrollSection = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={`min-w-0 ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1, margin: "0px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
};

const AnimatedWords = ({ text, className = "" }: { text: string; className?: string }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: false, amount: 0.75 }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: reduceMotion ? 0 : 0.06 } } }}
      aria-label={text}
    >
      {text.split(" ").map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden="true"
          className="mr-[0.24em] inline-block"
          variants={{
            hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, filter: "blur(4px)" },
            shown: { opacity: 1, y: 0, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

const PhoneChat = ({ dark = false, group = false }: { dark?: boolean; group?: boolean }) => (
  <div
    className={`relative mx-auto aspect-[9/17] w-[280px] overflow-hidden rounded-[32px] border-4 border-[#0a0a0a] shadow-[0_8px_0_0_#0a0a0a] ${
      dark ? "bg-[#18181b] text-white" : "bg-[#fffbec] text-[#0a0a0a]"
    }`}
  >
    <div className={`flex items-center justify-between border-b-2 border-[#0a0a0a] px-4 py-3 ${dark ? "bg-[#27272a]" : "bg-white"}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">‹</span>
        <div className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] gradient-brand" />
        <div>
          <p className="text-xs font-bold leading-tight">{group ? "Best Friends" : "Anika"}</p>
          <p className="text-[10px] font-mono text-emerald-600 font-semibold">● online</p>
        </div>
      </div>
      <div className="flex gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#0a0a0a] bg-white text-[#0a0a0a]">
          <Video className="h-3.5 w-3.5" />
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#0a0a0a] bg-white text-[#0a0a0a]">
          <Phone className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
    <div className="space-y-3 px-3 py-6">
      <Bubble name="Ayesha">Made it home safely! 🛵</Bubble>
      <Bubble own className="ml-auto">Such a fun day with chai ☕</Bubble>
      {group && (
        <>
          <Bubble name="Maya">Let’s plan Sunday meetup?</Bubble>
          <Bubble own className="ml-auto">Ready whenever you guys are! 🔥</Bubble>
        </>
      )}
    </div>
    <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-full border-2 border-[#0a0a0a] bg-white px-3 py-2 shadow-[0_3px_0_0_#0a0a0a]">
      <MessageCircle className="h-4 w-4 text-[#0a0a0a]" />
      <span className="flex-1 text-xs text-[#0a0a0a]/60">Message @username...</span>
      <Paperclip className="h-4 w-4 text-[#0a0a0a]" />
      <Mic className="h-4 w-4 text-violet-600" />
    </div>
  </div>
);

const DesktopApp = () => (
  <div className="relative mx-auto w-full max-w-[580px] rounded-2xl border-4 border-[#0a0a0a] bg-white p-2.5 shadow-[0_10px_0_0_#0a0a0a]">
    <div className="grid h-[330px] grid-cols-[38%_62%] overflow-hidden rounded-xl border-2 border-[#0a0a0a]">
      <div className="border-r-2 border-[#0a0a0a] bg-[#fffbec] p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-extrabold text-sm tracking-tight text-[#0a0a0a]">Buzz Web</span>
          <Search className="h-3.5 w-3.5 text-[#0a0a0a]" />
        </div>
        <div className="space-y-2.5">
          {["Maya", "Ayesha", "Dario", "Family Group", "Delhi Friends"].map((n, i) => (
            <div key={n} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-black/5 transition-colors cursor-pointer">
              <div className="h-7 w-7 rounded-full border border-[#0a0a0a] gradient-brand" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate text-[#0a0a0a]">{n}</p>
                <p className="text-[10px] text-[#0a0a0a]/60 truncate">{i === 3 ? "Photo" : "See you soon!"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative bg-white p-4">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <p className="text-xs font-bold text-[#0a0a0a]">
            Ayesha <span className="text-[10px] font-mono font-semibold text-emerald-600">● online</span>
          </p>
          <div className="flex gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-[#0a0a0a] bg-[#e2ecff]">
              <Phone className="h-3 w-3" />
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-full border border-[#0a0a0a] bg-[#dcf4e4]">
              <Video className="h-3 w-3" />
            </span>
          </div>
        </div>
        <Bubble>Any plans for Saturday evening?</Bubble>
        <Bubble own className="ml-auto mt-2">Let’s meet at Connaught Place.</Bubble>
        <Bubble own className="ml-auto mt-2">Sounds perfect! ✨</Bubble>
      </div>
    </div>
    <div className="absolute -right-4 -top-6 w-36 rounded-xl border-2 border-[#0a0a0a] bg-[#18181b] p-3 text-white shadow-[0_5px_0_0_#0a0a0a]">
      <p className="text-[10px] font-bold text-amber-300">Incoming Buzz Call</p>
      <p className="text-xs font-extrabold mt-0.5 truncate">@ayesha_k</p>
      <div className="mt-2.5 flex justify-around">
        <span className="h-7 w-7 rounded-full bg-red-500 border border-white" />
        <span className="h-7 w-7 rounded-full bg-emerald-500 border border-white" />
      </div>
    </div>
  </div>
);

const MomentsPhone = () => (
  <div className="relative mx-auto aspect-[9/17] w-[280px] overflow-hidden rounded-[32px] border-4 border-[#0a0a0a] bg-[#18181b] shadow-[0_8px_0_0_#0a0a0a]">
    <img
      src={groupImage}
      alt="Friends sharing a Buzz Moment"
      width={1536}
      height={1024}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover opacity-85"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
    <div className="absolute inset-x-0 top-0 p-4 text-white">
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/30">
        <div className="h-full w-3/4 rounded-full bg-[#fce314]" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full border-2 border-white gradient-brand" />
        <div>
          <p className="text-xs font-bold text-white">Maya</p>
          <p className="text-[10px] text-white/80 font-mono">12 min ago · 24h moment</p>
        </div>
      </div>
    </div>
    <div className="absolute inset-x-4 bottom-4 text-white">
      <p className="mb-3 text-lg font-bold">Golden hour with my people ✨</p>
      <div className="flex items-center gap-2 rounded-full border-2 border-[#0a0a0a] bg-white px-3 py-2 text-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a]">
        <MessageCircle className="h-4 w-4" />
        <span className="flex-1 text-xs font-semibold">Reply to Moment</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  </div>
);

// Target: 25th March at 10:30 AM IST (UTC+5:30)
const LAUNCH_TARGET = new Date("2027-03-25T10:30:00+05:30").getTime();

const LaunchCountdownBar = ({ onClaim }: { onClaim: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
  }>(() => {
    const diff = LAUNCH_TARGET - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      isLive: false,
    };
  });

  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_TARGET - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isLive: false,
      });
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  if (timeLeft.isLive) {
    return (
      <aside
        aria-label="Official launch notice"
        className="relative z-50 border-b-2 border-[#0a0a0a] bg-[#DCF4E4] text-[#0a0a0a] shadow-sm select-none"
      >
        <div className="mx-auto flex min-h-[42px] max-w-[1160px] items-center justify-center gap-2 px-3 py-1.5 text-center text-xs sm:text-sm font-bold flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            🎉 BUZZ IS OFFICIALLY LIVE!
          </span>
          <span className="hidden sm:inline opacity-50">·</span>
          <span className="opacity-90 font-medium">Claim your unique @username before it's taken</span>
          <button
            onClick={onClaim}
            className="bz-btn bz-btn-ink ml-1.5 px-3 py-1 text-xs"
          >
            Claim Handle <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Official launch countdown"
      className="relative z-50 border-b-2 border-[#0a0a0a] bg-[#FFF6B8] text-[#0a0a0a] shadow-sm select-none"
    >
      <div className="mx-auto flex min-h-[44px] max-w-[1160px] items-center justify-between gap-3 px-3 sm:px-5 py-1.5 flex-wrap sm:flex-nowrap">
        {/* Left: Badge & Title */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-tight">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-extrabold uppercase">
            <Rocket className="h-3.5 w-3.5" />
            <span>OFFICIAL LAUNCH</span>
          </span>
          <span className="hidden md:inline-block opacity-75 text-[11px] font-mono font-medium">
            (25 March · 10:30 AM IST)
          </span>
        </div>

        {/* Center: Neo-Brutalist Countdown timer units */}
        <div className="flex items-center gap-1 sm:gap-1.5 font-mono font-extrabold text-xs sm:text-sm mx-auto sm:mx-0">
          <div className="flex items-center gap-0.5 rounded-lg border border-[#0a0a0a] bg-white px-2 py-0.5 shadow-[0_2px_0_0_#0a0a0a]">
            <span>{timeLeft.days}</span>
            <span className="text-[10px] font-sans font-medium text-black/60">d</span>
          </div>
          <span className="font-extrabold">:</span>
          <div className="flex items-center gap-0.5 rounded-lg border border-[#0a0a0a] bg-white px-2 py-0.5 shadow-[0_2px_0_0_#0a0a0a]">
            <span>{pad(timeLeft.hours)}</span>
            <span className="text-[10px] font-sans font-medium text-black/60">h</span>
          </div>
          <span className="font-extrabold">:</span>
          <div className="flex items-center gap-0.5 rounded-lg border border-[#0a0a0a] bg-white px-2 py-0.5 shadow-[0_2px_0_0_#0a0a0a]">
            <span>{pad(timeLeft.minutes)}</span>
            <span className="text-[10px] font-sans font-medium text-black/60">m</span>
          </div>
          <span className="font-extrabold">:</span>
          <div className="flex items-center gap-0.5 rounded-lg border border-[#0a0a0a] bg-[#FCE314] px-2 py-0.5 shadow-[0_2px_0_0_#0a0a0a]">
            <span>{pad(timeLeft.seconds)}</span>
            <span className="text-[10px] font-sans font-medium text-black/70">s</span>
          </div>
        </div>

        {/* Right: CTA Button */}
        <div className="hidden sm:flex items-center">
          <button
            onClick={onClaim}
            className="bz-btn bz-btn-ink px-3.5 py-1 text-xs font-bold"
          >
            Pre-register @handle <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};

const BuzzLanding = ({ page = "/" }: { page?: string }) => {
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const openAuth = () => {
    setMenuOpen(false);
    setAuthOpen(true);
  };

  return (
    <div id="top" className="min-h-screen bz-grid-paper text-[#0a0a0a]">
      {/* Top Header & Sticky Navigation */}
      <header className="sticky top-0 z-50 border-b-2 border-[#0a0a0a] bg-[#fffbec]/95 backdrop-blur">
        {/* Sticky Launch Countdown Bar */}
        <LaunchCountdownBar onClaim={openAuth} />

        <div className="mx-auto flex h-[72px] max-w-[1160px] items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            <a href="#modes" className="text-[14px] font-bold text-[#0a0a0a] hover:text-[#0a0a0a]/70">Three Ways</a>
            <a href="#beliefs" className="text-[14px] font-bold text-[#0a0a0a] hover:text-[#0a0a0a]/70">Philosophy</a>
            {[...publicPages].slice(0, 4).map((p) => (
              <Link
                key={p}
                to={`/${p}`}
                className="text-[14px] font-bold capitalize text-[#0a0a0a] hover:text-[#0a0a0a]/70"
              >
                {p === "buzz-web" ? "Buzz Web" : p}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={openAuth}
              className="bz-btn bz-btn-white hidden px-4 py-2 text-sm sm:inline-flex"
            >
              Log In
            </button>
            <InstallAppDialog
              trigger={
                <button className="bz-btn bz-btn-yellow px-5 py-2 text-sm">
                  Get Buzz <ArrowDownToLine className="h-4 w-4" />
                </button>
              }
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="border-2 border-[#0a0a0a] rounded-full lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <div className="border-t-2 border-[#0a0a0a] bg-[#fffbec] p-5 lg:hidden">
            <nav className="grid gap-3" aria-label="Mobile navigation">
              <a href="#modes" onClick={() => setMenuOpen(false)} className="font-bold py-1">Three Ways to Use</a>
              <a href="#beliefs" onClick={() => setMenuOpen(false)} className="font-bold py-1">Philosophy</a>
              {publicPages.map((p) => (
                <Link
                  key={p}
                  to={`/${p}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-bold capitalize py-1"
                >
                  {p === "buzz-web" ? "Buzz Web" : p}
                </Link>
              ))}
              <div className="pt-2 flex gap-2">
                <button onClick={openAuth} className="bz-btn bz-btn-white flex-1 py-2 text-sm">Log In</button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {publicPages.includes(page.slice(1) as typeof publicPages[number]) ? (
          <BuzzPublicPage page={page.slice(1) as typeof publicPages[number]} onLogin={openAuth} />
        ) : (
          <>
            {/* HERO SECTION — buzzmessaging.ai Style with Paper Texture & Neo-Brutalism */}
            <section className="relative border-b-2 border-[#0a0a0a] px-5 py-16 md:py-24 text-center overflow-hidden">
              <div className="mx-auto max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#0a0a0a] bg-white px-3.5 py-1.5 shadow-[0_3px_0_0_#0a0a0a] mb-6">
                  <span className="bz-label">BUZZ MESSAGING</span>
                  <span className="text-black/40">·</span>
                  <span className="text-xs font-bold text-[#0a0a0a]">No Phone Numbers</span>
                  <span className="text-black/40">·</span>
                  <span className="text-xs font-bold text-[#0a0a0a]">Made in India 🇮🇳</span>
                </div>

                <h1 className="font-extrabold text-4xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight text-[#0a0a0a]">
                  Message privately.<br />
                  <span className="bz-squig">Without phone numbers.</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg md:text-xl font-medium text-[#5b5b55] leading-relaxed">
                  Simple, reliable, private messaging and calling where your username is your identity. Share your personal link, record Ghost Voice notes, and talk freely.
                </p>

                {/* Tactile Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                  <InstallAppDialog
                    trigger={
                      <button className="bz-btn bz-btn-yellow px-7 py-3.5 text-base sm:text-lg">
                        Get Buzz Messaging <ArrowRight className="h-4 w-4" />
                      </button>
                    }
                  />
                  <button
                    onClick={openAuth}
                    className="bz-btn bz-btn-white px-6 py-3.5 text-base sm:text-lg"
                  >
                    Claim your @handle
                  </button>
                </div>

                {/* Badges Row */}
                <div className="mt-8 flex flex-wrap justify-center gap-2.5 text-xs font-bold">
                  <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3.5 py-1 shadow-[0_2px_0_0_#0a0a0a]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-800" /> End-to-End Encrypted
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#E2ECFF] px-3.5 py-1 shadow-[0_2px_0_0_#0a0a0a]">
                    <Ghost className="h-3.5 w-3.5 text-blue-800" /> Ghost Voice Filters
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#EEE5FF] px-3.5 py-1 shadow-[0_2px_0_0_#0a0a0a]">
                    <Zap className="h-3.5 w-3.5 text-purple-800" /> 100% Free P2P Calling
                  </span>
                </div>
              </div>

              {/* Visual Hero Mockup */}
              <div className="mt-14 mx-auto max-w-5xl">
                <div className="relative rounded-2xl border-4 border-[#0a0a0a] bg-white p-3 md:p-6 shadow-[0_12px_0_0_#0a0a0a]">
                  <div className="grid gap-6 lg:grid-cols-2 items-center">
                    <div className="order-2 lg:order-1 text-left p-4">
                      <div className="inline-block -rotate-2 rounded-lg border-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 font-mono text-xs font-bold mb-3 shadow-[0_2px_0_0_#0a0a0a]">
                        REALTIME & PWA READY
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0a0a0a]">
                        Your phone number stays in your pocket.
                      </h2>
                      <p className="mt-3 text-sm sm:text-base text-[#5b5b55] leading-relaxed">
                        WhatsApp asks for your phone number. Buzz only asks for a unique @handle. No spam callers, no leaked contacts, no invasive trackers.
                      </p>
                      <div className="mt-5 flex gap-3">
                        <button onClick={openAuth} className="bz-btn bz-btn-ink px-5 py-2 text-sm">
                          Try Live Preview <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="order-1 lg:order-2 flex justify-center">
                      <PhoneChat />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* THREE WAYS TO USE IT (Bento Grid matching buzzmessaging.ai) */}
            <section id="modes" className="scroll-mt-20 border-b-2 border-[#0a0a0a] bg-white px-5 py-20">
              <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
                  <div>
                    <p className="bz-label">BUZZ ECOSYSTEM</p>
                    <h2 className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0a0a0a]">
                      One app. <span className="bz-squig">Three superpowers.</span>
                    </h2>
                  </div>
                  <p className="max-w-md text-sm sm:text-base text-[#5b5b55]">
                    Engineered from ground up for pure privacy, effortless viral connections, and authentic conversations.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {/* Card 1: Personal & Groups */}
                  <div className="bz-card p-6 bg-[#DCF4E4] flex flex-col justify-between">
                    <div>
                      <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_3px_0_0_#0a0a0a]">
                        <MessageCircle className="h-6 w-6 text-[#0a0a0a]" />
                      </div>
                      <span className="mt-4 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                        01 · Personal
                      </span>
                      <h3 className="mt-2 text-2xl font-extrabold text-[#0a0a0a]">Personal & Groups</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#2d5a3e]">
                        Private one-to-one chats, close friends circles, voice messages, reactions and media compression directly inside your device.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-[#0a0a0a]/20 flex items-center justify-between text-xs font-bold text-[#0a0a0a]">
                      <span>E2E Protected</span>
                      <span>100% Free</span>
                    </div>
                  </div>

                  {/* Card 2: Guest Chat */}
                  <div className="bz-card p-6 bg-[#E2ECFF] flex flex-col justify-between">
                    <div>
                      <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_3px_0_0_#0a0a0a]">
                        <Ghost className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="mt-4 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-blue-900">
                        02 · Anonymous Links
                      </span>
                      <h3 className="mt-2 text-2xl font-extrabold text-[#0a0a0a]">Guest Chat & Voice</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#274472]">
                        Share your personal link <code className="bg-white/70 px-1 py-0.5 rounded border border-[#0a0a0a]/20 font-mono text-xs">/c/@username</code>. Anyone can chat or send 4 Ghost Voice notes without creating an account.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-[#0a0a0a]/20 flex items-center justify-between text-xs font-bold text-[#0a0a0a]">
                      <span>Downloadable QR</span>
                      <span>Zero Friction</span>
                    </div>
                  </div>

                  {/* Card 3: Zero-Trace Identity */}
                  <div className="bz-card p-6 bg-[#EEE5FF] flex flex-col justify-between">
                    <div>
                      <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_3px_0_0_#0a0a0a]">
                        <ShieldCheck className="h-6 w-6 text-purple-700" />
                      </div>
                      <span className="mt-4 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-purple-900">
                        03 · Identity
                      </span>
                      <h3 className="mt-2 text-2xl font-extrabold text-[#0a0a0a]">Zero Phone Number</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#4b306b]">
                        Your phone number is never asked, stored, or shared. Connect via username search or QR code scan with 100% peace of mind.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-[#0a0a0a]/20 flex items-center justify-between text-xs font-bold text-[#0a0a0a]">
                      <span>DPDP India Safe</span>
                      <span>Verified @handle</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* WHAT WE BELIEVE / PHILOSOPHIES SECTION */}
            <section id="beliefs" className="scroll-mt-20 border-b-2 border-[#0a0a0a] bz-grid-paper px-5 py-20">
              <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-12">
                  <div>
                    <p className="bz-label">WHAT WE BELIEVE</p>
                    <h2 className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0a0a0a]">
                      Our philosophies
                    </h2>
                  </div>
                  <span className="inline-block -rotate-3 font-serif italic text-lg sm:text-xl font-bold text-amber-700">
                    (we actually mean these)
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="bz-card p-7 bg-[#FFF6B8]">
                    <div className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a]">
                      <span className="text-xl">🇮🇳</span>
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold text-[#0a0a0a]">Made in India</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#5a5220]">
                      Designed and built with Indian values — private family connections, respect for privacy, and digital independence for the next billion users.
                    </p>
                  </div>

                  <div className="bz-card p-7 bg-[#DCF4E4]">
                    <div className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a]">
                      <LockKeyhole className="h-5 w-5 text-emerald-800" />
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold text-[#0a0a0a]">Private by default</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#2d5a3e]">
                      Privacy isn't a buried setting you have to search for. No phone numbers, no tracking ads, and zero selling of personal data.
                    </p>
                  </div>

                  <div className="bz-card p-7 bg-[#FFE4CC]">
                    <div className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a]">
                      <Zap className="h-5 w-5 text-orange-700" />
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold text-[#0a0a0a]">Zero Fee P2P Calling</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#6b3815]">
                      Direct device-to-device audio and video calls over WebRTC. No paid gatekeepers, no calling charges, high quality voice anywhere.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CALL ON BUZZ WEB & DESKTOP MOCKUP */}
            <ScrollSection id="desktop" className="border-b-2 border-[#0a0a0a] bg-white px-5 py-20">
              <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
                <div>
                  <div className="inline-block rounded-lg border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3 py-1 font-mono text-xs font-bold mb-4 shadow-[0_2px_0_0_#0a0a0a]">
                    BUZZ ON ANY SCREEN
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0a0a0a] leading-[1.05]">
                    Call and chat right from your laptop.
                  </h2>
                  <p className="mt-5 text-base sm:text-lg text-[#5b5b55] leading-relaxed">
                    Open Buzz Web in Chrome, Safari or Edge. No QR scanning from a phone required if your account is active — pure username login.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button onClick={openAuth} className="bz-btn bz-btn-ink px-6 py-3 text-sm">
                      Open Buzz Web <ArrowRight className="h-4 w-4" />
                    </button>
                    <InstallAppDialog
                      trigger={
                        <button className="bz-btn bz-btn-white px-6 py-3 text-sm">
                          Install App <ArrowDownToLine className="h-4 w-4" />
                        </button>
                      }
                    />
                  </div>
                </div>
                <div>
                  <DesktopApp />
                </div>
              </div>
            </ScrollSection>

            {/* BUZZ MOMENTS SECTION */}
            <ScrollSection className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-5 py-20">
              <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
                <MomentsPhone />
                <div>
                  <div className="inline-flex items-center gap-2 rounded-lg border-2 border-[#0a0a0a] bg-white px-3 py-1 font-mono text-xs font-bold mb-4 shadow-[0_2px_0_0_#0a0a0a]">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> 24-HOUR STATUS
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0a0a0a] leading-[1.05]">
                    Share the moment before it passes.
                  </h2>
                  <p className="mt-5 text-base sm:text-lg text-[#5a5220] leading-relaxed">
                    Post photos, short videos or thoughts for your friends. Moments automatically disappear after 24 hours, and you can see who viewed each one with live viewer counts.
                  </p>
                  <div className="mt-8">
                    <button onClick={openAuth} className="bz-btn bz-btn-ink px-6 py-3 text-sm">
                      Share a Moment <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </ScrollSection>

            {/* CLOSING CTA CARD */}
            <section className="px-5 py-20 bz-grid-paper border-b-2 border-[#0a0a0a]">
              <div className="mx-auto max-w-4xl rounded-3xl border-4 border-[#0a0a0a] bg-[#0a0a0a] p-8 sm:p-14 text-center text-white shadow-[0_12px_0_0_#0a0a0a]">
                <img
                  src={buzzLogo}
                  alt="Buzz"
                  className="mx-auto mb-6 h-16 w-16 rounded-2xl border-2 border-white object-cover"
                />
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Your people are already one username away.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base text-white/80">
                  Pre-register your handle for the official launch on 25th March 2027 at 10:30 AM IST.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={openAuth}
                    className="bz-btn bz-btn-yellow px-7 py-3.5 text-base font-extrabold"
                  >
                    Claim your @handle <ArrowRight className="h-4 w-4" />
                  </button>
                  <InstallAppDialog
                    trigger={
                      <button className="bz-btn bz-btn-white px-7 py-3.5 text-base font-extrabold">
                        Install PWA <ArrowDownToLine className="h-4 w-4" />
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
      <footer className="border-t-2 border-[#0a0a0a] bg-[#fffbec] px-7 py-14 text-[#0a0a0a]">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 sm:flex-row">
          <div>
            <Logo />
            <p className="mt-4 text-xs font-mono font-bold text-[#5b5b55] uppercase tracking-wider">
              Chat Without Digits · Made in India 🇮🇳
            </p>
            <div className="mt-5">
              <InstallAppDialog
                trigger={
                  <button className="bz-btn bz-btn-ink px-4 py-2 text-xs">
                    <ArrowDownToLine className="h-3.5 w-3.5" /> Install App
                  </button>
                }
              />
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-3" aria-label="Footer navigation">
            {publicPages.map((p) => (
              <Link
                key={p}
                to={`/${p}`}
                className="text-sm font-bold capitalize text-[#0a0a0a] hover:underline"
              >
                {p === "buzz-web" ? "Buzz Web" : p}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t-2 border-[#0a0a0a]/15 pt-6 text-xs font-bold text-[#5b5b55]">
          <span>© 2026 Buzz Messaging · All rights reserved</span>
          <span className="flex items-center gap-1.5">
            <LockKeyhole className="h-3.5 w-3.5 text-[#0a0a0a]" /> 100% Username Identity · Zero Phone Numbers
          </span>
        </div>
      </footer>

      {/* Auth Modal Dialog */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-h-[95vh] max-w-md overflow-y-auto border-4 border-[#0a0a0a] rounded-2xl p-0 shadow-[0_8px_0_0_#0a0a0a]">
          <AuthPage onAuth={() => setAuthOpen(false)} embedded />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuzzLanding;
