import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle, Phone, Users, Compass, CircleDot, Mic, Smile,
  UserPlus, Download, Sparkles, X, Volume2, VolumeX, Mail, Video, Image as ImageIcon, FileText, Bell, Shield,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import buzzLogo from "@/assets/buzz-logo.jpeg";

const STORAGE_KEY = "buzz-intro-completed-v1";
const EVENT_PREFIX = "sarkarisahayakguide-intro_seen";

export const hasSeenIntro = () => {
  try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
};
export const markIntroSeen = () => {
  try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
};
export const resetIntro = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};

/* ─────────────────────────────────────────────
   Kinetic-typography scene system
   Inspired by the reference reel: bold word
   reveals, dark↔light alternating backgrounds,
   squircle logo, floating bubbles & arc glow.
   ───────────────────────────────────────────── */

type Theme = "dark" | "light";
type SceneKind =
  | "kinetic"        // big bold words appear one by one
  | "logo"           // squircle / diamond logo reveal
  | "scatter"        // scattered floating feature words
  | "bubbles"        // central buzz logo with floating app cards
  | "arc"            // glowing arc + line
  | "finale";        // final "Welcome to Buzz" reveal

interface Scene {
  id: string;
  kind: SceneKind;
  theme: Theme;
  duration: number; // ms
  words?: { text: string; accent?: boolean }[]; // for kinetic / arc / finale
  caption?: string;
  scatter?: string[]; // floating words
}

const SCENES: Scene[] = [
  // Hook
  { id: "s1", kind: "kinetic", theme: "dark", duration: 2200,
    words: [{ text: "Tired" }, { text: "of" }, { text: "boring", accent: true }, { text: "chats?" }] },

  { id: "s2", kind: "kinetic", theme: "dark", duration: 2200,
    words: [{ text: "Numbers,", accent: true }, { text: "spam," }, { text: "OTPs" }, { text: "everywhere" }] },

  // Logo reveal — like the squircle frame
  { id: "logo", kind: "logo", theme: "light", duration: 2400, caption: "Meet Buzz" },

  // Big intro phrase
  { id: "s3", kind: "kinetic", theme: "light", duration: 2200,
    words: [{ text: "The" }, { text: "ultimate", accent: true }, { text: "chat" }, { text: "for" }, { text: "you" }] },

  // Scattered feature words
  { id: "scatter", kind: "scatter", theme: "light", duration: 2600,
    scatter: ["Streams", "Moments", "Crystal Calls", "Groups", "Voice Notes", "Reactions", "Files", "Photos", "@usernames", "PWA"] },

  // Bold combo
  { id: "s4", kind: "kinetic", theme: "light", duration: 2200,
    words: [{ text: "Prioritize" }, { text: "people,", accent: true }, { text: "not" }, { text: "noise" }] },

  // Bubbles around central logo — like the floating app cards frame
  { id: "bubbles", kind: "bubbles", theme: "light", duration: 3000, caption: "All-in-one" },

  // Dark switch with arc
  { id: "arc", kind: "arc", theme: "dark", duration: 2400,
    words: [{ text: "to" }, { text: "chat", accent: true }, { text: "freely," }] },

  { id: "s5", kind: "kinetic", theme: "dark", duration: 2200,
    words: [{ text: "to" }, { text: "share" }, { text: "moments,", accent: true }] },

  { id: "s6", kind: "kinetic", theme: "dark", duration: 2200,
    words: [{ text: "and" }, { text: "stay" }, { text: "connected", accent: true }] },

  // Finale
  { id: "finale", kind: "finale", theme: "dark", duration: 3200,
    words: [{ text: "Welcome" }, { text: "to" }, { text: "Buzz", accent: true }],
    caption: "Tap to start buzzing" },
];

/* ── Reusable kinetic word reveal ── */
const KineticWords: React.FC<{ words: Scene["words"]; theme: Theme; size?: "lg" | "xl" }> = ({ words = [], theme, size = "xl" }) => {
  const sizeClass = size === "xl" ? "text-5xl sm:text-7xl" : "text-4xl sm:text-6xl";
  const baseColor = theme === "dark" ? "text-white" : "text-slate-900";
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 ${sizeClass} font-extrabold tracking-tight leading-tight`}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.15 + i * 0.18, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className={
            w.accent
              ? "bg-gradient-to-r from-fuchsia-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(217,70,239,0.55)]"
              : baseColor
          }
        >
          {w.text}
        </motion.span>
      ))}
    </div>
  );
};

/* ── Squircle logo reveal ── */
const LogoReveal: React.FC<{ caption?: string }> = ({ caption }) => (
  <div className="relative flex flex-col items-center justify-center">
    {/* corner blobs forming the squircle frame, like the reference */}
    {[
      "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
      "top-0 right-0 translate-x-1/2 -translate-y-1/2",
      "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
      "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    ].map((cls, i) => (
      <motion.div
        key={i}
        className={`absolute h-44 w-44 rounded-full bg-gradient-to-br from-purple-700 to-fuchsia-600 ${cls}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.95 }}
        transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 120, damping: 14 }}
      />
    ))}

    {/* central glow */}
    <motion.div
      className="absolute h-64 w-64 rounded-3xl bg-white blur-2xl opacity-80"
      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
    />

    {/* squircle logo */}
    <motion.div
      className="relative flex h-40 w-40 items-center justify-center rounded-[2.2rem] bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-500 shadow-2xl ring-4 ring-white/60"
      initial={{ scale: 0, rotate: -45, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 180, damping: 14 }}
      style={{ boxShadow: "0 0 80px rgba(217,70,239,0.6)" }}
    >
      <img src={buzzLogo} alt="Buzz" className="h-24 w-24 rounded-2xl object-cover" />
    </motion.div>

    {caption && (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="mt-10 text-2xl font-extrabold tracking-tight text-slate-900"
      >
        {caption}
      </motion.div>
    )}
  </div>
);

/* ── Scattered floating feature words ── */
const ScatterWords: React.FC<{ words: string[] }> = ({ words }) => {
  const positions = useMemo(() => words.map((_, i) => ({
    top: 10 + ((i * 37) % 75),
    left: 5 + ((i * 53) % 80),
    rot: -10 + ((i * 7) % 20),
    scale: 0.7 + ((i * 13) % 8) / 10,
    accent: i % 3 === 0,
    delay: (i % 6) * 0.12,
  })), [words]);
  return (
    <div className="relative h-80 w-full max-w-2xl">
      {words.map((w, i) => {
        const p = positions[i];
        return (
          <motion.span
            key={w}
            initial={{ opacity: 0, scale: 0.4, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: p.scale, filter: "blur(0px)" }}
            transition={{ delay: 0.2 + p.delay, duration: 0.6, type: "spring", stiffness: 140 }}
            className={`absolute font-extrabold tracking-tight ${
              p.accent
                ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent text-3xl sm:text-4xl"
                : "text-slate-900 text-xl sm:text-2xl"
            }`}
            style={{
              top: `${p.top}%`, left: `${p.left}%`,
              transform: `rotate(${p.rot}deg)`,
            }}
          >
            {w}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ── Floating app/feature bubbles around central Buzz ── */
const BuzzBubbles: React.FC<{ caption?: string }> = ({ caption }) => {
  const bubbles = [
    { Icon: MessageCircle, color: "from-emerald-300 to-emerald-200", angle: -100, dist: 150 },
    { Icon: Mail,          color: "from-pink-400 to-rose-300",       angle: -160, dist: 170 },
    { Icon: Phone,         color: "from-violet-400 to-purple-300",   angle: -20,  dist: 160 },
    { Icon: Video,         color: "from-sky-300 to-blue-200",        angle: 60,   dist: 170 },
    { Icon: Users,         color: "from-amber-300 to-orange-200",    angle: 130,  dist: 160 },
    { Icon: ImageIcon,     color: "from-fuchsia-400 to-pink-300",    angle: 180,  dist: 150 },
  ];
  return (
    <div className="relative flex h-80 w-full items-center justify-center">
      {/* halo */}
      <motion.div
        className="absolute h-60 w-60 rounded-full bg-gradient-to-br from-purple-200 to-fuchsia-200 blur-2xl"
        initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 0.9 }} transition={{ duration: 0.8 }}
      />
      <motion.div
        className="absolute h-44 w-44 rounded-3xl border-2 border-purple-300/60"
        initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
      />
      {/* center logo squircle */}
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-xl ring-4 ring-white"
      >
        <img src={buzzLogo} alt="Buzz" className="h-14 w-14 rounded-xl object-cover" />
      </motion.div>

      {bubbles.map((b, i) => {
        const rad = (b.angle * Math.PI) / 180;
        const x = Math.cos(rad) * b.dist;
        const y = Math.sin(rad) * b.dist;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{ x, y, opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.1, type: "spring", stiffness: 140, damping: 14 }}
            className="absolute"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.4 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
              className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${b.color} px-4 py-2 shadow-lg ring-2 ring-white`}
            >
              <div className="h-2 w-12 rounded-full bg-white/80" />
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                <b.Icon className="h-4 w-4 text-purple-600" />
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sp-${i}`}
          className="absolute text-fuchsia-500"
          style={{
            top: `${15 + ((i * 41) % 70)}%`,
            left: `${10 + ((i * 29) % 80)}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3 }}
        >
          ✦
        </motion.div>
      ))}

      {caption && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute -bottom-2 text-sm font-bold uppercase tracking-[0.3em] text-purple-700"
        >
          {caption}
        </motion.div>
      )}
    </div>
  );
};

/* ── Arc + words scene ── */
const ArcScene: React.FC<{ words?: Scene["words"] }> = ({ words = [] }) => (
  <div className="relative flex h-72 w-full items-center justify-center">
    <motion.svg
      viewBox="0 0 600 300"
      className="absolute inset-x-0 mx-auto h-full w-full max-w-2xl"
      initial="hidden" animate="visible"
    >
      <defs>
        <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
          <stop offset="50%" stopColor="#d946ef" stopOpacity="1" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 20 260 Q 300 -40 580 260"
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        style={{ filter: "drop-shadow(0 0 12px rgba(217,70,239,0.8))" }}
      />
    </motion.svg>
    <div className="relative">
      <KineticWords words={words} theme="dark" size="lg" />
    </div>
  </div>
);

/* ── Finale ── */
const Finale: React.FC<{ words?: Scene["words"]; caption?: string }> = ({ words = [], caption }) => (
  <div className="flex flex-col items-center gap-6">
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 14 }}
      className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-2xl ring-4 ring-white/30"
      style={{ boxShadow: "0 0 60px rgba(217,70,239,0.7)" }}
    >
      <img src={buzzLogo} alt="Buzz" className="h-14 w-14 rounded-2xl object-cover" />
    </motion.div>
    <KineticWords words={words} theme="dark" />
    {caption && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-2 text-sm font-semibold uppercase tracking-[0.35em] text-white/70"
      >
        {caption}
      </motion.div>
    )}
  </div>
);

/* ── Backgrounds for each theme ── */
const SceneBackground: React.FC<{ theme: Theme }> = ({ theme }) => {
  if (theme === "dark") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#0b0b1f]">
        <motion.div
          className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-purple-600/40 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-24 h-[460px] w-[460px] rounded-full bg-fuchsia-600/40 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* subtle starfield */}
        {[...Array(28)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/70"
            style={{ top: `${(i * 53) % 100}%`, left: `${(i * 31) % 100}%` }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + (i % 5), repeat: Infinity, delay: (i % 7) * 0.2 }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <motion.div
        className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-fuchsia-200/80 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-24 h-[460px] w-[460px] rounded-full bg-purple-200/80 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

/* ── Always-on persistent background animation (runs continuously across all scenes) ── */
const PersistentBackground: React.FC<{ theme: Theme }> = ({ theme }) => {
  const particles = useMemo(
    () => Array.from({ length: 22 }).map((_, i) => ({
      left: (i * 37) % 100,
      top: (i * 53) % 100,
      size: 4 + ((i * 7) % 10),
      dur: 6 + ((i * 3) % 8),
      delay: (i % 9) * 0.4,
      hue: i % 3,
    })),
    []
  );
  const orbs = useMemo(
    () => Array.from({ length: 5 }).map((_, i) => ({
      left: (i * 23 + 10) % 90,
      top: (i * 41 + 5) % 80,
      size: 220 + ((i * 60) % 220),
      dur: 14 + ((i * 5) % 10),
      delay: i * 0.7,
      hue: i % 3,
    })),
    []
  );
  const sparkles = useMemo(
    () => Array.from({ length: 14 }).map((_, i) => ({
      left: (i * 29 + 7) % 100,
      top: (i * 47 + 13) % 100,
      dur: 2.4 + ((i * 2) % 4),
      delay: (i % 7) * 0.35,
    })),
    []
  );
  const orbColors = ["bg-fuchsia-500/30", "bg-purple-500/30", "bg-blue-500/30"];
  const particleColors = theme === "dark"
    ? ["bg-white/70", "bg-fuchsia-300/80", "bg-purple-300/80"]
    : ["bg-fuchsia-500/60", "bg-purple-500/60", "bg-pink-500/60"];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbs.map((o, i) => (
        <motion.div
          key={`orb-${i}`}
          className={`absolute rounded-full blur-3xl ${orbColors[o.hue]}`}
          style={{ left: `${o.left}%`, top: `${o.top}%`, width: o.size, height: o.size }}
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 25, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut", delay: o.delay }}
        />
      ))}
      {particles.map((p, i) => (
        <motion.div
          key={`p-${i}`}
          className={`absolute rounded-full ${particleColors[p.hue]}`}
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -80, 0], opacity: [0, 0.9, 0], scale: [0.6, 1.2, 0.6] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
      {sparkles.map((s, i) => (
        <motion.span
          key={`s-${i}`}
          className={`absolute text-base ${theme === "dark" ? "text-white" : "text-fuchsia-500"}`}
          style={{ left: `${s.left}%`, top: `${s.top}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.4], rotate: [0, 180, 360] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
};

interface IntroExperienceProps {
  source: "first-visit" | "replay";
  onClose: () => void;
}

const IntroExperience = ({ source, onClose }: IntroExperienceProps) => {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const startedAt = useRef(Date.now());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscNodesRef = useRef<{ stop: () => void }[]>([]);
  const scene = SCENES[index];
  const isLast = index === SCENES.length - 1;

  /* ── Procedural upbeat music (cinematic kinetic feel) ── */
  useEffect(() => {
    const startMusic = () => {
      if (audioCtxRef.current) return;
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        const ctx: AudioContext = new AC();
        audioCtxRef.current = ctx;
        const master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.28;
        master.connect(ctx.destination);
        masterGainRef.current = master;

        const delay = ctx.createDelay();
        delay.delayTime.value = 0.23;
        const fb = ctx.createGain(); fb.gain.value = 0.38;
        const wet = ctx.createGain(); wet.gain.value = 0.35;
        delay.connect(fb).connect(delay);
        delay.connect(wet).connect(master);

        const padFilter = ctx.createBiquadFilter();
        padFilter.type = "lowpass"; padFilter.frequency.value = 1800;
        padFilter.connect(master);

        const padFreqs = [220, 261.63, 329.63, 440, 523.25];
        padFreqs.forEach((f) => {
          const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
          const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 2;
          const g = ctx.createGain(); g.gain.value = 0;
          g.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 2.5);
          o.connect(g).connect(padFilter); o2.connect(g);
          o.start(); o2.start();
          oscNodesRef.current.push({ stop: () => { try { o.stop(); o2.stop(); } catch {} } });
        });

        const kick = (t: number) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.frequency.setValueAtTime(140, t);
          o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
          g.gain.setValueAtTime(0.7, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          o.connect(g).connect(master);
          o.start(t); o.stop(t + 0.22);
        };
        const hat = (t: number, vol = 0.12) => {
          const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
          const src = ctx.createBufferSource(); src.buffer = buf;
          const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7000;
          const g = ctx.createGain();
          g.gain.setValueAtTime(vol, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          src.connect(hp).connect(g).connect(master);
          src.start(t);
        };
        const snap = (t: number) => {
          const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
          const src = ctx.createBufferSource(); src.buffer = buf;
          const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.35, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          src.connect(bp).connect(g).connect(master);
          src.start(t);
        };
        const bass = (t: number, freq: number) => {
          const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq;
          const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 600;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.18, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
          o.connect(f).connect(g).connect(master);
          o.start(t); o.stop(t + 0.3);
        };
        const lead = (t: number, freq: number) => {
          const o = ctx.createOscillator(); o.type = "square"; o.frequency.value = freq;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.07, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          o.connect(g).connect(master); g.connect(delay);
          o.start(t); o.stop(t + 0.25);
        };

        const STEP = 0.1172;
        const arpNotes = [523.25, 659.25, 783.99, 1046.5, 880, 783.99, 659.25, 587.33,
                          523.25, 659.25, 880, 1046.5, 1318.5, 1046.5, 880, 659.25];
        const bassNotes = [110, 110, 110, 164.81, 146.83, 146.83, 130.81, 130.81];
        let step = 0;
        let nextTime = ctx.currentTime + 0.1;
        const scheduler = window.setInterval(() => {
          if (!audioCtxRef.current) return;
          while (nextTime < ctx.currentTime + 0.3) {
            const s = step % 16;
            if (s % 4 === 0) kick(nextTime);
            if (s === 4 || s === 12) snap(nextTime);
            hat(nextTime, s % 2 === 1 ? 0.14 : 0.07);
            if (s % 2 === 0) bass(nextTime, bassNotes[(step / 2) % bassNotes.length | 0]);
            lead(nextTime, arpNotes[s]);
            nextTime += STEP;
            step++;
          }
        }, 60);
        oscNodesRef.current.push({ stop: () => clearInterval(scheduler) });
      } catch { /* ignore */ }
    };
    startMusic();
    const resume = () => audioCtxRef.current?.resume();
    window.addEventListener("pointerdown", resume, { once: true });

    return () => {
      window.removeEventListener("pointerdown", resume);
      oscNodesRef.current.forEach((n) => n.stop());
      oscNodesRef.current = [];
      const ctx = audioCtxRef.current;
      if (ctx) {
        masterGainRef.current?.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        setTimeout(() => { try { ctx.close(); } catch {} }, 400);
      }
      audioCtxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !masterGainRef.current) return;
    masterGainRef.current.gain.linearRampToValueAtTime(muted ? 0 : 0.28, ctx.currentTime + 0.2);
  }, [muted]);

  useEffect(() => {
    trackEvent(`${EVENT_PREFIX}.viewed`, { source, totalScenes: SCENES.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    trackEvent(`${EVENT_PREFIX}.scene_viewed`, { sceneId: scene.id, index, source });
  }, [index, scene.id, source]);

  const handleSkip = () => {
    trackEvent(`${EVENT_PREFIX}.skipped`, {
      atSceneId: scene.id, atIndex: index,
      durationMs: Date.now() - startedAt.current, source,
    });
    markIntroSeen(); onClose();
  };

  const handleComplete = () => {
    trackEvent(`${EVENT_PREFIX}.completed`, {
      durationMs: Date.now() - startedAt.current, source,
    });
    markIntroSeen(); onClose();
  };

  // Auto-advance using per-scene duration
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (isLast) handleComplete();
      else setIndex((i) => i + 1);
    }, scene.duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const progress = useMemo(() => (index + 1) / SCENES.length, [index]);

  const renderScene = () => {
    switch (scene.kind) {
      case "kinetic":
        return <KineticWords words={scene.words} theme={scene.theme} />;
      case "logo":
        return <LogoReveal caption={scene.caption} />;
      case "scatter":
        return <ScatterWords words={scene.scatter || []} />;
      case "bubbles":
        return <BuzzBubbles caption={scene.caption} />;
      case "arc":
        return <ArcScene words={scene.words} />;
      case "finale":
        return <Finale words={scene.words} caption={scene.caption} />;
    }
  };

  const textColor = scene.theme === "dark" ? "text-white" : "text-slate-900";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] overflow-hidden"
      onClick={() => { if (isLast) handleComplete(); }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id + "-bg"}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0"
        >
          <SceneBackground theme={scene.theme} />
        </motion.div>
      </AnimatePresence>

      {/* Top bar */}
      <div className={`relative z-10 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7 ${textColor}`}>
        <div className="flex items-center gap-2">
          <img src={buzzLogo} alt="" className="h-8 w-8 rounded-lg object-cover ring-1 ring-black/10" />
          <span className="text-sm font-extrabold tracking-[0.25em]">BUZZ</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
            aria-label={muted ? "Unmute" : "Mute"}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-all active:scale-95 ${
              scene.theme === "dark" ? "bg-white/15 text-white hover:bg-white/25" : "bg-black/10 text-slate-900 hover:bg-black/20"
            }`}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleSkip(); }}
            className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur transition-all active:scale-95 ${
              scene.theme === "dark" ? "bg-white/15 text-white hover:bg-white/25" : "bg-black/10 text-slate-900 hover:bg-black/20"
            }`}
          >
            Skip <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scene stage */}
      <div className="relative z-10 flex h-[calc(100%-160px)] items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id + "-stage"}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full max-w-3xl items-center justify-center"
          >
            {renderScene()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom progress */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-8 sm:pb-10">
        <div className="mx-auto h-1 max-w-md overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-500"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ boxShadow: "0 0 10px rgba(217,70,239,0.7)" }}
          />
        </div>
        <div className={`mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.3em] ${
          scene.theme === "dark" ? "text-white/60" : "text-slate-500"
        }`}>
          {index + 1} / {SCENES.length} · {isLast ? "tap anywhere to enter" : "auto"}
        </div>
      </div>
    </motion.div>
  );
};

export default IntroExperience;
export { Sparkles as Play };
