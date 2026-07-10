import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "800", "900"], subsets: ["latin"] });

const SAFFRON = "#FF9933";
const GREEN = "#138808";
const NAVY = "#000080";
const PURPLE = "#7C3AED";
const PINK = "#EC4899";

// Persistent animated tricolor background
const BG: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = Math.sin(frame / 60) * 30;
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(${135 + shift}deg, #0b0b1a 0%, #1a0b2e 40%, #0b0b1a 100%)`,
    }}>
      {/* soft tricolor glows */}
      <div style={{ position: "absolute", top: "-10%", left: "-20%", width: 900, height: 900, borderRadius: "50%", background: SAFFRON, filter: "blur(180px)", opacity: 0.25 }} />
      <div style={{ position: "absolute", bottom: "-15%", right: "-20%", width: 900, height: 900, borderRadius: "50%", background: GREEN, filter: "blur(180px)", opacity: 0.22 }} />
      <div style={{ position: "absolute", top: "40%", left: "30%", width: 500, height: 500, borderRadius: "50%", background: PURPLE, filter: "blur(160px)", opacity: 0.35 }} />
    </AbsoluteFill>
  );
};

// Ashoka Chakra SVG
const Chakra: React.FC<{ size: number; color?: string }> = ({ size, color = NAVY }) => {
  const spokes = Array.from({ length: 24 });
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      <circle r="42" fill="none" stroke={color} strokeWidth="3" />
      <circle r="6" fill={color} />
      {spokes.map((_, i) => (
        <line key={i} x1="0" y1="0" x2="0" y2="-42" stroke={color} strokeWidth="2"
          transform={`rotate(${(360 / 24) * i})`} />
      ))}
    </svg>
  );
};

// Indian Flag component
const Flag: React.FC<{ w: number; h: number; wave?: number }> = ({ w, h, wave = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: 12, overflow: "hidden", position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    transform: `perspective(600px) rotateY(${wave}deg)`,
  }}>
    <div style={{ height: "33.33%", background: SAFFRON }} />
    <div style={{ height: "33.33%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Chakra size={h * 0.28} />
    </div>
    <div style={{ height: "33.33%", background: GREEN }} />
  </div>
);

// SCENE 1: Hook - Made in India + Logo
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flagScale = spring({ frame, fps, config: { damping: 12 } });
  const wave = Math.sin(frame / 12) * 8;
  const textOp = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const textY = interpolate(frame, [25, 45], [30, 0], { extrapolateRight: "clamp" });
  const logoOp = interpolate(frame, [60, 85], [0, 1], { extrapolateRight: "clamp" });
  const logoScale = spring({ frame: frame - 60, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{ transform: `scale(${flagScale})` }}>
        <Flag w={520} h={340} wave={wave} />
      </div>
      <div style={{ marginTop: 60, opacity: textOp, transform: `translateY(${textY}px)`, textAlign: "center" }}>
        <div style={{ fontSize: 42, color: "#fff", opacity: 0.7, fontWeight: 600, letterSpacing: 8 }}>PROUDLY</div>
        <div style={{ fontSize: 110, fontWeight: 900, background: `linear-gradient(90deg, ${SAFFRON}, #fff 50%, ${GREEN})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>
          MADE IN
        </div>
        <div style={{ fontSize: 160, fontWeight: 900, background: `linear-gradient(90deg, ${SAFFRON}, #fff 50%, ${GREEN})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
          INDIA
        </div>
      </div>
      <div style={{ marginTop: 60, opacity: logoOp, transform: `scale(${logoScale})`, display: "flex", alignItems: "center", gap: 24 }}>
        <Img src={staticFile("images/buzz-logo.jpeg")} style={{ width: 160, height: 160, borderRadius: 40, boxShadow: `0 20px 60px ${PURPLE}80` }} />
      </div>
    </AbsoluteFill>
  );
};

// SCENE 2: Introducing Buzz
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 14 } });
  const s2 = spring({ frame: frame - 15, fps, config: { damping: 14 } });
  const s3 = spring({ frame: frame - 30, fps, config: { damping: 14 } });
  const logoRot = interpolate(frame, [0, 40], [-180, 0], { extrapolateRight: "clamp" });
  const logoScale = spring({ frame, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div style={{ opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }), fontSize: 44, color: SAFFRON, fontWeight: 700, letterSpacing: 4, marginBottom: 40, transform: `translateY(${(1 - s1) * 40}px)` }}>
        INTRODUCING
      </div>
      <Img src={staticFile("images/buzz-logo.jpeg")} style={{
        width: 340, height: 340, borderRadius: 80,
        transform: `scale(${logoScale}) rotate(${logoRot}deg)`,
        boxShadow: `0 30px 100px ${PURPLE}90, 0 0 0 8px rgba(255,255,255,0.1)`,
      }} />
      <div style={{ marginTop: 60, textAlign: "center", opacity: s2, transform: `translateY(${(1 - s2) * 40}px)` }}>
        <div style={{ fontSize: 200, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: -4 }}>BUZZ</div>
      </div>
      <div style={{ marginTop: 30, opacity: s3, transform: `translateY(${(1 - s3) * 30}px)`, fontSize: 42, color: "#fff", fontWeight: 500, textAlign: "center", maxWidth: 900, lineHeight: 1.3 }}>
        Bharat ka apna messenger
      </div>
      <div style={{ marginTop: 20, opacity: s3, fontSize: 32, color: GREEN, fontWeight: 700, letterSpacing: 3 }}>
        🇮🇳 SWADESHI · SECURE · FREE
      </div>
    </AbsoluteFill>
  );
};

// SCENE 3: Features grid
const featureList = [
  { icon: "💬", title: "Messages", sub: "Instant & Real-time", color: PURPLE },
  { icon: "📞", title: "Voice Calls", sub: "Crystal clear HD", color: SAFFRON },
  { icon: "📹", title: "Video Calls", sub: "Face to face anywhere", color: PINK },
  { icon: "✨", title: "Moments", sub: "24hr stories", color: GREEN },
  { icon: "👥", title: "Groups", sub: "Unlimited connections", color: NAVY },
  { icon: "🔒", title: "Private", sub: "End-to-end secure", color: "#0ea5e9" },
];

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleS = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", padding: 80, paddingTop: 140 }}>
      <div style={{ transform: `translateY(${(1 - titleS) * 40}px)`, opacity: titleS, textAlign: "center", marginBottom: 60 }}>
        <div style={{ fontSize: 44, color: SAFFRON, fontWeight: 700, letterSpacing: 4 }}>ALL IN ONE APP</div>
        <div style={{ fontSize: 96, color: "#fff", fontWeight: 900, lineHeight: 1.1, marginTop: 10 }}>Features</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, width: "100%" }}>
        {featureList.map((f, i) => {
          const s = spring({ frame: frame - 15 - i * 6, fps, config: { damping: 14 } });
          return (
            <div key={i} style={{
              opacity: s, transform: `scale(${s}) translateY(${(1 - s) * 40}px)`,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255,255,255,0.15)",
              borderRadius: 32, padding: 40, textAlign: "center",
              boxShadow: `0 20px 40px ${f.color}30`,
            }}>
              <div style={{ fontSize: 90, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 38, color: "#fff", fontWeight: 800 }}>{f.title}</div>
              <div style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>{f.sub}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// SCENE 4: Phone mockup with chat
const Bubble: React.FC<{ text: string; me?: boolean; delay: number; time: string }> = ({ text, me, delay, time }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  return (
    <div style={{
      alignSelf: me ? "flex-end" : "flex-start",
      maxWidth: "75%",
      opacity: s,
      transform: `translateX(${me ? (1 - s) * 40 : (1 - s) * -40}px) scale(${s})`,
      background: me ? `linear-gradient(135deg, ${PURPLE}, ${PINK})` : "#fff",
      color: me ? "#fff" : "#111",
      padding: "18px 24px",
      borderRadius: 24,
      borderBottomRightRadius: me ? 6 : 24,
      borderBottomLeftRadius: me ? 24 : 6,
      fontSize: 28, fontWeight: 500,
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      marginBottom: 8,
    }}>
      {text}
      <div style={{ fontSize: 16, opacity: 0.7, marginTop: 4, textAlign: "right" }}>{time} ✓✓</div>
    </div>
  );
};

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneS = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{
        width: 780, height: 1400,
        background: "#000", borderRadius: 70,
        padding: 20, boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
        transform: `scale(${phoneS}) translateY(${(1 - phoneS) * 60}px)`,
        border: "4px solid #333",
      }}>
        <div style={{
          width: "100%", height: "100%", borderRadius: 52,
          background: "linear-gradient(180deg, #f5f3ff, #fce7f3)",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}>
          {/* header */}
          <div style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, padding: "36px 30px 24px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color: PURPLE }}>R</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 30, fontWeight: 700 }}>Rahul 🇮🇳</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 20 }}>online</div>
            </div>
            <div style={{ display: "flex", gap: 20, fontSize: 36 }}>📞 📹</div>
          </div>
          {/* messages */}
          <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Bubble text="Namaste bhai! 🙏" delay={10} time="10:30" />
            <Bubble text="Ye Buzz app kaisa hai?" delay={25} time="10:30" />
            <Bubble me text="Bhai ekdum mast! Made in India 🇮🇳" delay={45} time="10:31" />
            <Bubble me text="Free hai, fast hai, secure hai 🔒" delay={65} time="10:31" />
            <Bubble text="Wah! Abhi download karta hoon 🚀" delay={95} time="10:32" />
          </div>
          {/* input */}
          <div style={{ padding: 20, background: "#fff", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 30, padding: "16px 24px", fontSize: 24, color: "#999" }}>Type a message...</div>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>➤</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 5: CTA
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 10 } });
  const s2 = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const s3 = spring({ frame: frame - 40, fps, config: { damping: 14 } });
  const pulse = 1 + Math.sin(frame / 8) * 0.03;

  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div style={{ transform: `scale(${s1 * pulse})`, position: "relative" }}>
        <Img src={staticFile("images/buzz-logo.jpeg")} style={{
          width: 380, height: 380, borderRadius: 90,
          boxShadow: `0 40px 120px ${PURPLE}, 0 0 0 12px rgba(255,255,255,0.1)`,
        }} />
      </div>
      <div style={{ marginTop: 50, opacity: s2, transform: `translateY(${(1 - s2) * 30}px)`, textAlign: "center" }}>
        <div style={{ fontSize: 220, fontWeight: 900, color: "#fff", letterSpacing: -6, lineHeight: 1 }}>BUZZ</div>
        <div style={{ fontSize: 40, color: SAFFRON, fontWeight: 700, letterSpacing: 6, marginTop: 10 }}>MADE IN INDIA 🇮🇳</div>
      </div>
      <div style={{ marginTop: 60, opacity: s3, transform: `scale(${s3})`, background: `linear-gradient(90deg, ${SAFFRON}, #fff, ${GREEN})`, padding: "28px 60px", borderRadius: 60, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: NAVY, letterSpacing: 2 }}>TRY IT NOW</div>
      </div>
      <div style={{ marginTop: 30, opacity: s3, fontSize: 30, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
        buzzofficial.vercel.app
      </div>
    </AbsoluteFill>
  );
};

export { Scene1, Scene2, Scene3, Scene4, Scene5, BG };
