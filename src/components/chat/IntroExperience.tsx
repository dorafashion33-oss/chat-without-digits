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

const GroupsVisual: React.FC = () => (
  <div className="grid grid-cols-2 grid-rows-2 gap-3 p-6">
    {["AR", "PR", "SK", "NV"].map((n, i) => (
      <motion.div
        key={n}
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
        className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-white/25 to-white/5 text-2xl font-bold text-white backdrop-blur ring-2 ring-white/20"
      >
        {n}
      </motion.div>
    ))}
  </div>
);

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
    id: "streams",
    title: "Lightning Streams",
    subtitle: "Send messages with optimistic delivery, blue ticks & typing dots.",
    accent: "MessageCircle",
    gradient: "from-teal-500 via-cyan-500 to-blue-600",
    Visual: StreamsVisual,
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
    subtitle: "Voice & video with WhatsApp-style ringtones — uniquely Buzz.",
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
];

interface IntroExperienceProps {
  source: "first-visit" | "replay";
  onClose: () => void;
}

const IntroExperience = ({ source, onClose }: IntroExperienceProps) => {
  const [index, setIndex] = useState(0);
  const startedAt = useRef(Date.now());
  const scene = SCENES[index];
  const isLast = index === SCENES.length - 1;

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
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur transition-all hover:bg-white/25 active:scale-95"
        >
          Skip <X className="h-3.5 w-3.5" />
        </button>
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
