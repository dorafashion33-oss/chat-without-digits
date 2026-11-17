import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDownToLine, ArrowRight, Menu, X, Flag, Shield, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InstallAppDialog from "@/components/chat/InstallAppDialog";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import type { ComponentType } from "react";
import BuzzPublicPage, * as BuzzPublicPageModule from "./BuzzPublicPage";

const { publicPages } = BuzzPublicPageModule;
const BuzzRealtimeChatSimulator =
  (BuzzPublicPageModule as unknown as { BuzzRealtimeChatSimulator: ComponentType }).BuzzRealtimeChatSimulator;

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
    <div className="sticky top-0 z-50 w-full border-b-2 border-[#0a0a0a] bg-[#FCE314] px-3 py-2 text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs font-black">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0a0a0a] bg-white px-2 py-0.5 text-[11px] shadow-[1px_1px_0_0_#0a0a0a]">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            GRAND LAUNCH
          </span>
          <span className="hidden sm:inline">25th March 2027 at 10:30 AM IST</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5 shadow-[1px_1px_0_0_#0a0a0a]">{timeLeft.days}d</span>
            <span>:</span>
            <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5 shadow-[1px_1px_0_0_#0a0a0a]">{timeLeft.hours}h</span>
            <span>:</span>
            <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5 shadow-[1px_1px_0_0_#0a0a0a]">{timeLeft.minutes}m</span>
            <span>:</span>
            <span className="rounded border border-[#0a0a0a] bg-white px-1.5 py-0.5 shadow-[1px_1px_0_0_#0a0a0a]">{timeLeft.seconds}s</span>
          </div>

          <button
            onClick={onClaim}
            className="rounded-lg border-2 border-[#0a0a0a] bg-[#0a0a0a] px-3 py-1 text-[11px] font-black uppercase text-white shadow-[2px_2px_0_0_#0a0a0a] hover:bg-[#222]"
          >
            Claim @Handle
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BuzzLanding({ page = "/" }: { page?: string }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);

  const normalizedPage = page.replace(/^\//, "").toLowerCase();
  const isCustomPublicPage = publicPages.includes(normalizedPage as any);

  const openAuth = (mode: "login" | "signup" = "login") => {
    navigate(`/auth?mode=${mode}`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#0a0a0a] selection:bg-[#FCE314]">
      <LaunchCountdownBar onClaim={() => openAuth("signup")} />

      {/* Top Navbar */}
      <header className="sticky top-[41px] z-40 border-b-2 border-[#0a0a0a] bg-[#FFFDF7]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="overflow-hidden rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[2px_2px_0_0_#0a0a0a]">
              <img src={buzzLogo} alt="Buzz Logo" className="h-9 w-9 object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#0a0a0a]">BUZZ</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#0a0a0a]/60">Made In India</span>
            </div>
          </Link>

          {/* Desktop Nav - 6 Public Pages */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-black uppercase">
            <Link to="/features" className={`hover:underline ${normalizedPage === "features" ? "text-primary" : ""}`}>
              Features
            </Link>
            <Link to="/guest-chat" className={`hover:underline ${normalizedPage === "guest-chat" ? "text-primary" : ""}`}>
              Guest Chat
            </Link>
            <Link to="/made-in-india" className={`flex items-center gap-1 text-[#ff9933] hover:underline ${normalizedPage === "made-in-india" ? "font-black" : ""}`}>
              <Flag className="h-3 w-3" /> Made In India
            </Link>
            <Link to="/privacy" className={`hover:underline ${normalizedPage === "privacy" ? "text-primary" : ""}`}>
              Privacy
            </Link>
            <Link to="/buzz-web" className={`hover:underline ${normalizedPage === "buzz-web" ? "text-primary" : ""}`}>
              Buzz Web
            </Link>
            <Link to="/download" className={`hover:underline ${normalizedPage === "download" ? "text-primary" : ""}`}>
              Download
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuth("login")}
              className="hidden sm:inline-flex rounded-xl border-2 border-[#0a0a0a] bg-white px-3.5 py-1.5 text-xs font-black uppercase text-[#0a0a0a] shadow-[2px_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth("signup")}
              className="rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] px-4 py-1.5 text-xs font-black uppercase text-[#0a0a0a] shadow-[3px_3px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
            >
              Get Buzz Free
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[2px_2px_0_0_#0a0a0a]"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t-2 border-[#0a0a0a] bg-[#FFFDF7] p-4 lg:hidden"
            >
              <div className="flex flex-col gap-3 text-xs font-black uppercase">
                <Link to="/features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                <Link to="/guest-chat" onClick={() => setMobileMenuOpen(false)}>Guest Chat Link</Link>
                <Link to="/made-in-india" onClick={() => setMobileMenuOpen(false)} className="text-[#ff9933] flex items-center gap-1">
                  <Flag className="h-3.5 w-3.5" /> Made In India
                </Link>
                <Link to="/privacy" onClick={() => setMobileMenuOpen(false)}>Privacy</Link>
                <Link to="/buzz-web" onClick={() => setMobileMenuOpen(false)}>Buzz Web</Link>
                <Link to="/download" onClick={() => setMobileMenuOpen(false)}>Download App</Link>
                <div className="pt-2 border-t-2 border-[#0a0a0a]/10 flex gap-2">
                  <button onClick={() => openAuth("login")} className="flex-1 rounded-xl border-2 border-[#0a0a0a] bg-white py-2 font-black">
                    Sign In
                  </button>
                  <button onClick={() => openAuth("signup")} className="flex-1 rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] py-2 font-black">
                    Claim @Handle
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>
        {isCustomPublicPage ? (
          <BuzzPublicPage page={normalizedPage as any} onLogin={() => openAuth("login")} />
        ) : (
          <div className="space-y-20 pb-20">
            {/* HERO SECTION */}
            <section className="border-b-3 border-[#0a0a0a] px-4 sm:px-6 py-16 sm:py-24 text-center bg-[#FFFDF7]">
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#0a0a0a] bg-white px-4 py-1.5 text-xs font-black shadow-[3px_3px_0_0_#0a0a0a]">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  No Phone Numbers · No Email Required · Zero Tracking
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-[#0a0a0a]">
                  The Sovereign Messenger <br />
                  <span className="underline decoration-[#FCE314] decoration-8">For The New Internet.</span>
                </h1>

                <p className="max-w-2xl mx-auto text-sm sm:text-lg font-bold text-[#0a0a0a]/80 leading-relaxed">
                  Connect without giving away your personal phone number. Claim your unique @username,
                  send anonymous confessions, modulate Ghost Voice notes, and call peer-to-peer.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAuth("signup")}
                    className="flex items-center gap-2 rounded-2xl border-3 border-[#0a0a0a] bg-[#FCE314] px-6 py-3.5 text-sm font-black uppercase text-[#0a0a0a] shadow-[4px_4px_0_0_#0a0a0a] hover:bg-[#FFF6B8] hover:-translate-y-0.5 transition-all"
                  >
                    Claim Your @Username Free <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setInstallOpen(true)}
                    className="flex items-center gap-2 rounded-2xl border-3 border-[#0a0a0a] bg-white px-6 py-3.5 text-sm font-black uppercase text-[#0a0a0a] shadow-[4px_4px_0_0_#0a0a0a] hover:bg-gray-100 transition-all"
                  >
                    <ArrowDownToLine className="h-4 w-4" /> Install App (PWA)
                  </button>
                </div>
              </div>
            </section>

            {/* LIVE CHAT SIMULATOR SHOWCASE */}
            <section className="px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
              <div className="space-y-2">
                <span className="rounded-full border border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 text-xs font-black uppercase">
                  Interactive Simulator
                </span>
                <h2 className="text-2xl sm:text-4xl font-black uppercase text-[#0a0a0a]">
                  Experience Buzz Live Right Now
                </h2>
                <p className="text-xs sm:text-sm font-bold text-[#0a0a0a]/70">
                  Type a test message below to see how fast and clean Buzz responds!
                </p>
              </div>
              <BuzzRealtimeChatSimulator />
            </section>

            {/* 3 CORE PILLARS GRID */}
            <section className="px-4 sm:px-6 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-7 shadow-[6px_6px_0_0_#0a0a0a] space-y-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FCE314] shadow-[2px_2px_0_0_#0a0a0a]">
                    <Shield className="h-6 w-6 text-[#0a0a0a]" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-[#0a0a0a]">Zero Phone Identity</h3>
                  <p className="text-xs font-bold leading-relaxed text-[#0a0a0a]/75">
                    Never reveal your mobile number to strangers, colleges, or marketplace buyers. Your identity is your
                    sovereign @handle.
                  </p>
                </div>

                <div className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-7 shadow-[6px_6px_0_0_#0a0a0a] space-y-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FFF6B8] shadow-[2px_2px_0_0_#0a0a0a]">
                    <Mic className="h-6 w-6 text-[#0a0a0a]" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-[#0a0a0a]">Ghost Voice Modulation</h3>
                  <p className="text-xs font-bold leading-relaxed text-[#0a0a0a]/75">
                    Disguise your real voice with Deep Mafia, Cyber Robot, Whisper Echo or Ghost pitch effects directly inside
                    the browser.
                  </p>
                </div>

                <div className="rounded-3xl border-3 border-[#0a0a0a] bg-white p-7 shadow-[6px_6px_0_0_#0a0a0a] space-y-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#22c55e] text-white shadow-[2px_2px_0_0_#0a0a0a]">
                    <Flag className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-[#0a0a0a]">Proudly Indian</h3>
                  <p className="text-xs font-bold leading-relaxed text-[#0a0a0a]/75">
                    Sovereign data principles, zero foreign ad surveillance, optimized for Indian network connectivity
                    and Hindi localization.
                  </p>
                </div>
              </div>
            </section>

            {/* CALL TO ACTION BANNER */}
            <section className="px-4 sm:px-6 max-w-4xl mx-auto">
              <div className="rounded-3xl border-3 border-[#0a0a0a] bg-[#FCE314] p-8 sm:p-12 text-center shadow-[8px_8px_0_0_#0a0a0a] space-y-6">
                <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0a0a0a]">
                  Ready To Buzz Without Giving Up Your Privacy?
                </h2>
                <p className="text-sm font-bold text-[#0a0a0a]/80 max-w-lg mx-auto">
                  Claim your favorite username before someone else takes it. It only takes 10 seconds.
                </p>
                <button
                  onClick={() => openAuth("signup")}
                  className="rounded-2xl border-3 border-[#0a0a0a] bg-[#0a0a0a] px-8 py-4 text-sm font-black uppercase text-white shadow-[4px_4px_0_0_#0a0a0a] hover:bg-neutral-800"
                >
                  Create My Free Buzz Handle Now
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t-3 border-[#0a0a0a] bg-white py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <img src={buzzLogo} alt="Buzz Logo" className="h-8 w-8 rounded-lg border border-[#0a0a0a]" />
            <span className="text-base font-black text-[#0a0a0a]">BUZZ MESSENGER</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-black uppercase">
            <Link to="/features" className="hover:underline">Features</Link>
            <Link to="/guest-chat" className="hover:underline">Guest Chat</Link>
            <Link to="/made-in-india" className="text-[#ff9933] hover:underline">Made In India</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/buzz-web" className="hover:underline">Buzz Web</Link>
            <Link to="/download" className="hover:underline">Download</Link>
          </div>

          <p className="text-[11px] font-bold text-[#0a0a0a]/60">
            © 2027 Buzz Messenger. Zero Phone Number Identity.
          </p>
        </div>
      </footer>

      <InstallAppDialog open={installOpen} onOpenChange={setInstallOpen} />
    </div>
  );
}
