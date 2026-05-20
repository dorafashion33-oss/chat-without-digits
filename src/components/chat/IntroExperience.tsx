import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, CircleDot, Phone, Compass, Users, Sparkles, ChevronRight, X, Play, Volume2, VolumeX, UserPlus, Smile, Mic, Download, Shield } from "lucide-react";
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

interface IntroScene {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  gradient: string;
  Visual: React.FC;
}

/* ── Animated Scene Visuals ── */
const HeroVisual: React.FC = () => (
  <div className="relative flex h-full w-full items-center justify-center">
    <motion.div
      className="absolute h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500 blur-3xl opacity-60"
      animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.img
      src={buzzLogo}
      alt="Buzz"
      className="relative h-32 w-32 rounded-3xl object-cover shadow-2xl"
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 14 }}
    />
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-2 w-2 rounded-full bg-white"
        initial={{ x: 0, y: 0, opacity: 0 }}
        animate={{
          x: Math.cos((i / 8) * Math.PI * 2) * 140,
          y: Math.sin((i / 8) * Math.PI * 2) * 140,
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const StreamsVisual: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="w-72 space-y-2.5">
      {[
        { from: "Aarav", msg: "Yo! Buzz feels so smooth 🚀", mine: false, d: 0 },
        { from: "Me", msg: "Right? Instant delivery ⚡", mine: true, d: 0.3 },
        { from: "Aarav", msg: "Blue ticks too 💙", mine: false, d: 0.6 },
        { from: "Me", msg: "Typing indicator works fr", mine: true, d: 0.9 },
      ].map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: m.mine ? 40 : -40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: m.d, type: "spring", stiffness: 200 }}
          className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
        >
          <div className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-lg ${m.mine ? "bg-white text-purple-700" : "bg-white/15 text-white backdrop-blur"}`}>
            {m.msg}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const MomentsVisual: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center gap-3">
    {["from-pink-500 to-orange-400", "from-purple-600 to-blue-500", "from-emerald-400 to-cyan-500"].map((g, i) => (
      <motion.div
        key={i}
        initial={{ y: 60, opacity: 0, rotate: -8 + i * 4 }}
        animate={{ y: 0, opacity: 1, rotate: -6 + i * 6 }}
        transition={{ delay: i * 0.18, type: "spring", stiffness: 140 }}
        className={`h-56 w-32 rounded-3xl bg-gradient-to-br ${g} shadow-2xl ring-4 ring-white/30 flex items-end p-3`}
      >
        <div className="text-xs font-bold text-white drop-shadow">@user{i + 1}</div>
      </motion.div>
    ))}
  </div>
);

const ConnectVisual: React.FC = () => (
  <div className="relative flex h-full w-full items-center justify-center">
    <motion.div
      className="absolute h-48 w-48 rounded-full border-2 border-white/40"
      animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute h-48 w-48 rounded-full border-2 border-white/40"
      animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
    />
    <motion.div
      className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-2xl"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1.2, repeat: Infinity }}
    >
      <Phone className="h-12 w-12 text-green-500" />
    </motion.div>
  </div>
);

const GroupsVisual: React.FC = () => {
  const members = [
    { n: "AR", c: "from-fuchsia-500 to-pink-500" },
    { n: "PR", c: "from-amber-400 to-orange-500" },
    { n: "SK", c: "from-emerald-400 to-teal-500" },
    { n: "NV", c: "from-sky-400 to-blue-600" },
    { n: "JY", c: "from-violet-500 to-purple-700" },
    { n: "RA", c: "from-rose-400 to-red-500" },
  ];
  const radius = 110;
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Pulsing rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full border-2 border-white/40"
          style={{ height: 180, width: 180 }}
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
        />
      ))}

      {/* Orbiting connection lines */}
      <motion.svg
        className="absolute h-72 w-72"
        viewBox="-150 -150 300 300"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        {members.map((_, i) => {
          const a = (i / members.length) * Math.PI * 2;
          return (
            <motion.line
              key={i}
              x1={0} y1={0}
              x2={Math.cos(a) * radius}
              y2={Math.sin(a) * radius}
              stroke="white"
              strokeOpacity={0.35}
              strokeWidth={1.2}
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.12 }}
            />
          );
        })}
      </motion.svg>

      {/* Orbiting avatars */}
      <motion.div
        className="absolute h-72 w-72"
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        {members.map((m, i) => {
          const a = (i / members.length) * Math.PI * 2;
          return (
            <motion.div
              key={m.n}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 220 }}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) translate(${Math.cos(a) * radius}px, ${Math.sin(a) * radius}px)`,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${m.c} text-sm font-bold text-white shadow-2xl ring-2 ring-white/40`}
              >
                {m.n}
                <motion.span
                  className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Center group hub */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-purple-600 shadow-2xl"
      >
        <Users className="h-10 w-10" />
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ boxShadow: "0 0 40px 8px rgba(255,255,255,0.6)" }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </motion.div>

      {/* Floating chat bubbles */}
      {["Hey crew 👋", "Movie tonight?", "I'm in! 🎬", "Count me 🔥"].map((t, i) => (
        <motion.div
          key={t}
          className="absolute rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-purple-700 shadow-lg"
          initial={{ opacity: 0, y: 20, scale: 0.6 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [20, -10 - i * 8, -40 - i * 12, -70 - i * 16],
            scale: [0.6, 1, 1, 0.8],
            x: (i - 1.5) * 70,
          }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
        >
          {t}
        </motion.div>
      ))}
    </div>
  );
};


const DiscoverVisual: React.FC = () => (
  <div className="relative flex h-full w-full items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      className="relative h-64 w-64"
    >
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -ml-6 -mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-purple-600 shadow-xl"
          style={{
            transform: `rotate(${i * 60}deg) translateY(-110px) rotate(-${i * 60}deg)`,
          }}
        >
          @
        </motion.div>
      ))}
    </motion.div>
    <div className="absolute flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl">
      <Compass className="h-10 w-10 text-purple-600" />
    </div>
  </div>
);

const UsernameVisual: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center">
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180 }}
      className="w-72 rounded-3xl bg-white/15 backdrop-blur-xl p-6 ring-2 ring-white/30 shadow-2xl"
    >
      <div className="flex items-center gap-2 text-white/80 text-xs mb-2"><Shield className="h-3.5 w-3.5" /> No phone. No email.</div>
      <div className="rounded-2xl bg-white/20 px-4 py-3 flex items-center gap-2 mb-3">
        <span className="text-white font-bold text-lg">@</span>
        <motion.span
          className="text-white font-bold text-lg"
          initial={{ width: 0 }}
          animate={{ width: "auto" }}
        >
          {"yourname".split("").map((c, i) => (
            <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}>{c}</motion.span>
          ))}
        </motion.span>
        <motion.span className="ml-auto text-emerald-300" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, type: "spring" }}>✓</motion.span>
      </div>
      <div className="rounded-xl bg-gradient-to-r from-fuchsia-400 to-purple-500 py-2.5 text-center text-sm font-bold text-white shadow-lg">
        Claim username
      </div>
    </motion.div>
  </div>
);

const ReactionsVisual: React.FC = () => (
  <div className="relative flex h-full w-full items-center justify-center">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="rounded-2xl bg-white px-5 py-3 text-purple-700 font-medium shadow-2xl max-w-[240px]"
    >
      You're going to love Buzz 💜
    </motion.div>
    {["❤️", "🔥", "😂", "👏", "✨"].map((e, i) => (
      <motion.div
        key={i}
        className="absolute text-3xl"
        initial={{ y: 40, opacity: 0, scale: 0.5 }}
        animate={{
          y: [-20 - i * 30, -120 - i * 30],
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0.8],
          x: (i - 2) * 40,
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.25 }}
      >
        {e}
      </motion.div>
    ))}
  </div>
);

const VoiceVisual: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="flex items-center gap-3 rounded-full bg-white/15 backdrop-blur-xl px-5 py-3 ring-2 ring-white/20 shadow-2xl">
      <motion.div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-500 shadow-lg" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
        <Mic className="h-6 w-6" />
      </motion.div>
      <div className="flex items-end gap-1 h-10">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-white"
            animate={{ height: [6, 24 + Math.random() * 14, 6] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }}
          />
        ))}
      </div>
      <span className="text-white font-mono text-sm">0:12</span>
    </div>
  </div>
);

const InstallVisual: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center">
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative w-56 h-80 rounded-[2.5rem] bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl p-3 ring-4 ring-white/30 shadow-2xl"
    >
      <div className="h-full w-full rounded-[2rem] bg-white/90 flex flex-col items-center justify-center gap-3 p-4">
        <img src={buzzLogo} alt="" className="h-16 w-16 rounded-2xl shadow-lg" />
        <div className="text-purple-700 font-bold text-lg">Buzz</div>
        <motion.div
          className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Download className="h-3.5 w-3.5" /> Install App
        </motion.div>
        <div className="text-[10px] text-purple-400 text-center">Works offline · Home screen</div>
      </div>
    </motion.div>
  </div>
);

const SCENES: IntroScene[] = [
  {
    id: "hero",
    title: "Welcome to Buzz",
    subtitle: "The next-gen way to message — no phone number needed.",
    accent: "Sparkles",
    gradient: "from-purple-600 via-fuchsia-500 to-blue-600",
    Visual: HeroVisual,
  },
  {
    id: "username",
    title: "Just a Username",
    subtitle: "No phone, no email — pick an @handle and you're in.",
    accent: "UserPlus",
    gradient: "from-indigo-600 via-purple-600 to-pink-600",
    Visual: UsernameVisual,
  },
  {
    id: "streams",
    title: "Lightning Streams",
    subtitle: "Optimistic delivery, blue ticks & live typing dots.",
    accent: "MessageCircle",
    gradient: "from-teal-500 via-cyan-500 to-blue-600",
    Visual: StreamsVisual,
  },
  {
    id: "reactions",
    title: "Express Yourself",
    subtitle: "Emoji reactions, edits, deletes & burst effects on every send.",
    accent: "Smile",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    Visual: ReactionsVisual,
  },
  {
    id: "voice",
    title: "Voice Notes",
    subtitle: "Hold to record, release to send — buttery smooth waveforms.",
    accent: "Mic",
    gradient: "from-rose-600 via-fuchsia-600 to-purple-700",
    Visual: VoiceVisual,
  },
  {
    id: "moments",
    title: "Share Moments",
    subtitle: "24-hour stories with stickers, gradients & viewer insights.",
    accent: "CircleDot",
    gradient: "from-orange-500 via-pink-500 to-rose-600",
    Visual: MomentsVisual,
  },
  {
    id: "connect",
    title: "Crystal Calls",
    subtitle: "Voice & video with a uniquely Buzz ringtone — plus call history.",
    accent: "Phone",
    gradient: "from-emerald-500 via-green-500 to-teal-600",
    Visual: ConnectVisual,
  },
  {
    id: "groups",
    title: "Group Power",
    subtitle: "Chat & mesh-call your whole crew at once.",
    accent: "Users",
    gradient: "from-violet-600 via-purple-600 to-indigo-600",
    Visual: GroupsVisual,
  },
  {
    id: "discover",
    title: "Discover People",
    subtitle: "Find friends by @username and start buzzing instantly.",
    accent: "Compass",
    gradient: "from-amber-500 via-orange-600 to-red-600",
    Visual: DiscoverVisual,
  },
  {
    id: "install",
    title: "Install Buzz",
    subtitle: "Add to home screen — fullscreen, fast & offline-ready.",
    accent: "Download",
    gradient: "from-slate-800 via-purple-800 to-fuchsia-700",
    Visual: InstallVisual,
  },
];

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

  // Start upbeat electronic music (procedural, no API key)
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

        // Stereo delay for space
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.23;
        const fb = ctx.createGain();
        fb.gain.value = 0.38;
        const wet = ctx.createGain();
        wet.gain.value = 0.35;
        delay.connect(fb).connect(delay);
        delay.connect(wet).connect(master);

        // Lowpass filter for warmth on pad
        const padFilter = ctx.createBiquadFilter();
        padFilter.type = "lowpass";
        padFilter.frequency.value = 1800;
        padFilter.connect(master);

        // Lush pad chord (Am9 → vibey)
        const padFreqs = [220, 261.63, 329.63, 440, 523.25];
        padFreqs.forEach((f) => {
          const o = ctx.createOscillator();
          o.type = "sawtooth";
          o.frequency.value = f;
          const o2 = ctx.createOscillator();
          o2.type = "sine";
          o2.frequency.value = f * 2;
          const g = ctx.createGain();
          g.gain.value = 0;
          g.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 2.5);
          o.connect(g).connect(padFilter);
          o2.connect(g);
          o.start(); o2.start();
          oscNodesRef.current.push({ stop: () => { try { o.stop(); o2.stop(); } catch {} } });
        });

        // Kick drum helper
        const kick = (t: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.setValueAtTime(140, t);
          o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
          g.gain.setValueAtTime(0.7, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          o.connect(g).connect(master);
          o.start(t); o.stop(t + 0.22);
        };

        // Hi-hat (noise burst)
        const hat = (t: number, vol = 0.12) => {
          const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const hp = ctx.createBiquadFilter();
          hp.type = "highpass"; hp.frequency.value = 7000;
          const g = ctx.createGain();
          g.gain.setValueAtTime(vol, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          src.connect(hp).connect(g).connect(master);
          src.start(t);
        };

        // Snap/clap
        const snap = (t: number) => {
          const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const bp = ctx.createBiquadFilter();
          bp.type = "bandpass"; bp.frequency.value = 1800;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.35, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          src.connect(bp).connect(g).connect(master);
          src.start(t);
        };

        // Bass note
        const bass = (t: number, freq: number) => {
          const o = ctx.createOscillator();
          o.type = "sawtooth";
          o.frequency.value = freq;
          const f = ctx.createBiquadFilter();
          f.type = "lowpass";
          f.frequency.value = 600;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.18, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
          o.connect(f).connect(g).connect(master);
          o.start(t); o.stop(t + 0.3);
        };

        // Lead arpeggio (A minor pentatonic, energetic)
        const lead = (t: number, freq: number) => {
          const o = ctx.createOscillator();
          o.type = "square";
          o.frequency.value = freq;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.07, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          o.connect(g).connect(master);
          g.connect(delay);
          o.start(t); o.stop(t + 0.25);
        };

        // 16-step sequencer at ~128 BPM (step = 0.117s)
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
            // Kick on 1, 5, 9, 13
            if (s % 4 === 0) kick(nextTime);
            // Snap on 5 and 13
            if (s === 4 || s === 12) snap(nextTime);
            // Hat every step, accent off-beats
            hat(nextTime, s % 2 === 1 ? 0.14 : 0.07);
            // Bass every other step
            if (s % 2 === 0) bass(nextTime, bassNotes[(step / 2) % bassNotes.length | 0]);
            // Lead arpeggio
            lead(nextTime, arpNotes[s]);
            nextTime += STEP;
            step++;
          }
        }, 60);
        oscNodesRef.current.push({ stop: () => clearInterval(scheduler) });
      } catch {
        // ignore
      }
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

  // Apply mute changes
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
      atSceneId: scene.id,
      atIndex: index,
      durationMs: Date.now() - startedAt.current,
      source,
    });
    markIntroSeen();
    onClose();
  };

  const handleComplete = () => {
    trackEvent(`${EVENT_PREFIX}.completed`, {
      durationMs: Date.now() - startedAt.current,
      source,
    });
    markIntroSeen();
    onClose();
  };

  const handleNext = () => {
    if (isLast) handleComplete();
    else setIndex((i) => i + 1);
  };

  const dotProgress = useMemo(() => (index + 1) / SCENES.length, [index]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${scene.gradient}`}
        />
      </AnimatePresence>

      {/* Ambient particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-white/40"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
            }}
            animate={{ y: -20 }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "linear",
            }}
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <div className="flex items-center gap-2">
          <img src={buzzLogo} alt="" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-sm font-bold text-white tracking-wide">BUZZ</span>
          <span className="ml-2 hidden rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white sm:inline">
            <Sparkles className="mr-1 inline h-3 w-3" /> Intro
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-all hover:bg-white/25 active:scale-95"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur transition-all hover:bg-white/25 active:scale-95"
          >
            Skip <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scene */}
      <div className="relative z-10 flex h-[calc(100%-200px)] flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id + "-visual"}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-72 w-full max-w-md items-center justify-center"
          >
            <scene.Visual />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id + "-text"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-8 max-w-md text-center"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-4xl">
              {scene.title}
            </h2>
            <p className="mt-3 text-base text-white/90 sm:text-lg">{scene.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-8 sm:pb-10">
        {/* Progress dots */}
        <div className="mb-5 flex justify-center gap-2">
          {SCENES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
              aria-label={`Go to scene ${i + 1}`}
            />
          ))}
        </div>

        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/25 active:scale-95 disabled:opacity-30"
          >
            Back
          </button>

          <div className="relative flex-1">
            <div className="absolute inset-0 rounded-full bg-white/10" />
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-white"
              initial={false}
              animate={{ width: `${dotProgress * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              style={{ height: "100%" }}
            />
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-full bg-white px-6 py-3 text-sm font-bold text-purple-700 shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            {isLast ? "Start Buzzing" : "Next"}
            {!isLast && <ChevronRight className="h-4 w-4" />}
            {isLast && <Sparkles className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default IntroExperience;
export { Play };
