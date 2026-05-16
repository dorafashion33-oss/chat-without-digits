import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  angle: number;
  distance: number;
}

const EMOJIS = ["✨", "💜", "💙", "💖", "⚡", "🌟", "💫"];

let counter = 0;

const BuzzBurst = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ x: number; y: number }>).detail;
      const x = detail?.x ?? window.innerWidth / 2;
      const y = detail?.y ?? window.innerHeight / 2;
      const newParticles: Particle[] = Array.from({ length: 14 }).map(() => ({
        id: counter++,
        x,
        y,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        angle: Math.random() * Math.PI * 2,
        distance: 60 + Math.random() * 80,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.find((n) => n.id === p.id)));
      }, 900);
    };
    window.addEventListener("buzz-burst", handler as EventListener);
    return () => window.removeEventListener("buzz-burst", handler as EventListener);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {particles.map((p) => {
        const dx = Math.cos(p.angle) * p.distance;
        const dy = Math.sin(p.angle) * p.distance - 40;
        return (
          <span
            key={p.id}
            className="absolute text-xl select-none"
            style={{
              left: p.x,
              top: p.y,
              transform: "translate(-50%, -50%)",
              animation: "buzz-burst-fly 0.9s cubic-bezier(0.2, 0.6, 0.3, 1) forwards",
              ["--dx" as any]: `${dx}px`,
              ["--dy" as any]: `${dy}px`,
            }}
          >
            {p.emoji}
          </span>
        );
      })}
    </div>
  );
};

export const triggerBuzzBurst = (x?: number, y?: number) => {
  window.dispatchEvent(new CustomEvent("buzz-burst", { detail: { x, y } }));
};

export default BuzzBurst;
