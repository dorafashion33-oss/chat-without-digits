import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  Globe,
  Lock,
  Menu,
  MessageCircle,
  Phone,
  Shield,
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

export default function BuzzLanding({ page = "/" }: { page?: string }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const openAuth = () => navigate("/auth");

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
            <a href="#india" className="text-[13px] font-bold text-[#0a0a0a] hover:underline flex items-center gap-1">
              Made in India 🇮🇳
            </a>
            <Link to="/privacy" className="text-[13px] font-bold text-[#0a0a0a] hover:underline">
              Privacy
            </Link>
            <Link to="/buzz-web" className="text-[13px] font-bold text-[#0a0a0a] hover:underline">
              Buzz Web
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
                <a href="#india" onClick={() => setMenuOpen(false)} className="font-bold py-1.5 border-b border-[#0a0a0a]/10 flex items-center gap-1">
                  Made in India Story 🇮🇳
                </a>
                <Link to="/privacy" onClick={() => setMenuOpen(false)} className="font-bold py-1.5 border-b border-[#0a0a0a]/10">
                  Privacy Guarantee
                </Link>
                <Link to="/buzz-web" onClick={() => setMenuOpen(false)} className="font-bold py-1.5 border-b border-[#0a0a0a]/10">
                  Buzz Web
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
        {publicPages.includes(page.slice(1) as typeof publicPages[number]) ? (
          <BuzzPublicPage page={page.slice(1) as typeof publicPages[number]} onLogin={openAuth} />
        ) : (
          <>
            {/* HERO SECTION */}
            <section className="relative border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 md:py-24 text-center overflow-hidden">
              <div className="mx-auto max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border-2 border-[#0a0a0a] bg-white px-3 sm:px-4 py-1.5 shadow-[0_3px_0_0_#0a0a0a] mb-6 text-xs font-black"
                >
                  <span className="bz-label">BUZZ MESSAGING</span>
                  <span className="text-black/30">·</span>
                  <span>No Phone Numbers</span>
                  <span className="text-black/30">·</span>
                  <span>Made in India 🇮🇳</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-extrabold text-3xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight text-[#0a0a0a]"
                >
                  Message privately.<br />
                  <span className="bz-squig">Without phone numbers.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg font-medium text-[#5b5b55] leading-relaxed"
                >
                  Simple, reliable, private messaging and calling where your unique username is your identity. Share your personal link, record Ghost Voice notes, and talk freely.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-3"
                >
                  <InstallAppDialog
                    trigger={
                      <button className="bz-btn bz-btn-yellow px-6 sm:px-8 py-3.5 text-sm sm:text-base font-black">
                        Get Buzz Messaging <ArrowRight className="h-4 w-4" />
                      </button>
                    }
                  />
                  <button onClick={openAuth} className="bz-btn bz-btn-white px-5 sm:px-6 py-3.5 text-sm sm:text-base font-bold">
                    Claim Username (@handle)
                  </button>
                </motion.div>
              </div>
            </section>

            {/* MADE IN INDIA 🇮🇳 ATMANIRBHAR SECTION */}
            <section id="india" className="border-b-2 border-[#0a0a0a] px-4 sm:px-6 py-14 sm:py-20 bg-white">
              <div className="mx-auto max-w-[1160px]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3 py-1 text-xs font-black text-emerald-900 shadow-[0_2px_0_0_#0a0a0a] mb-2">
                    🇮🇳 DIGITAL ATMANIRBHAR BHARAT
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#0a0a0a] tracking-tight">
                    Designed in India for Digital Freedom
                  </h2>
                  <p className="mt-3 text-sm text-[#5b5b55] leading-relaxed">
                    Why should 1.4 billion Indians share their mobile numbers with foreign Big Tech servers just to chat with friends and family?
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#FFF6B8] mb-4 text-2xl font-black">
                      🇮🇳
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">100% Indian Data Sovereignty</h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      Your identity is safe. Built by Indian developers with zero contact-book scraping and zero advertising tracking.
                    </p>
                  </div>

                  <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#E2ECFF] mb-4 text-2xl font-black">
                      🛡️
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">Shield Your Bank & Aadhaar</h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      Your phone number links to bank accounts and UPI. Buzz keeps your daily chatting identity completely isolated.
                    </p>
                  </div>

                  <div className="bz-card p-6 shadow-[0_6px_0_0_#0a0a0a]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#DCF4E4] mb-4 text-2xl font-black">
                      ⚡
                    </div>
                    <h3 className="text-base font-black text-[#0a0a0a]">Fast, Lightweight PWA</h3>
                    <p className="mt-2 text-xs text-[#5b5b55] leading-relaxed">
                      Runs fast on 4G and 5G networks across India with no bulky 100MB downloads. Installs in under 3 seconds.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t-2 border-[#0a0a0a] bg-[#FFF6B8] py-8 px-4 text-center text-xs font-bold text-[#0a0a0a]">
        <div className="mx-auto max-w-[1160px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026–2027 Buzz Messaging · Made in India 🇮🇳 · Chat Without Digits</p>
          <div className="flex gap-4">
            <Link to="/features" className="hover:underline">Features</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/download" className="hover:underline">Download</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
