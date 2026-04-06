import { useRef, useCallback, useEffect } from "react";

// Buzz-style unique ringtone - melodic two-note pattern
function createRingtone(ctx: AudioContext): OscillatorNode[] {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  // Buzz signature: warm chord with slight detune
  osc1.type = "sine";
  osc1.frequency.value = 523.25; // C5
  osc2.type = "triangle";
  osc2.frequency.value = 659.25; // E5
  osc3.type = "sine";
  osc3.frequency.value = 783.99; // G5
  
  filter.type = "lowpass";
  filter.frequency.value = 2000;
  filter.Q.value = 1;
  
  gain.gain.value = 0;
  
  osc1.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  // Buzz ring pattern: short melodic burst, pause, repeat
  const now = ctx.currentTime;
  for (let i = 0; i < 15; i++) {
    const base = now + i * 3; // 3s cycle
    // First ring pulse (0.4s)
    gain.gain.setValueAtTime(0, base);
    gain.gain.linearRampToValueAtTime(0.12, base + 0.05);
    gain.gain.setValueAtTime(0.12, base + 0.35);
    gain.gain.linearRampToValueAtTime(0, base + 0.4);
    // Second ring pulse (0.4s) - slightly higher
    osc1.frequency.setValueAtTime(587.33, base + 0.6); // D5
    osc2.frequency.setValueAtTime(739.99, base + 0.6); // F#5
    osc3.frequency.setValueAtTime(880, base + 0.6);    // A5
    gain.gain.setValueAtTime(0, base + 0.6);
    gain.gain.linearRampToValueAtTime(0.12, base + 0.65);
    gain.gain.setValueAtTime(0.12, base + 0.95);
    gain.gain.linearRampToValueAtTime(0, base + 1.0);
    // Reset frequencies for next cycle
    osc1.frequency.setValueAtTime(523.25, base + 1.2);
    osc2.frequency.setValueAtTime(659.25, base + 1.2);
    osc3.frequency.setValueAtTime(783.99, base + 1.2);
  }
  
  osc1.start();
  osc2.start();
  osc3.start();
  
  return [osc1, osc2, osc3];
}

// Buzz-style dial tone - gentle pulsing tone
function createDialTone(ctx: AudioContext): OscillatorNode[] {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = "sine";
  osc1.frequency.value = 440; // A4
  osc2.type = "sine";
  osc2.frequency.value = 554.37; // C#5 (major third)
  
  gain.gain.value = 0;
  
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  
  // Soft pulsing pattern: 0.8s on, 2.2s off
  const now = ctx.currentTime;
  for (let i = 0; i < 20; i++) {
    const base = now + i * 3;
    gain.gain.setValueAtTime(0, base);
    gain.gain.linearRampToValueAtTime(0.08, base + 0.1);
    gain.gain.setValueAtTime(0.08, base + 0.7);
    gain.gain.linearRampToValueAtTime(0, base + 0.8);
  }
  
  osc1.start();
  osc2.start();
  return [osc1, osc2];
}

export function useCallSounds() {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);

  const stopSound = useCallback(() => {
    oscsRef.current.forEach((o) => {
      try { o.stop(); } catch {}
    });
    oscsRef.current = [];
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, []);

  const playRingtone = useCallback(() => {
    stopSound();
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    oscsRef.current = createRingtone(ctx);
  }, [stopSound]);

  const playDialTone = useCallback(() => {
    stopSound();
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    oscsRef.current = createDialTone(ctx);
  }, [stopSound]);

  useEffect(() => {
    return () => { stopSound(); };
  }, [stopSound]);

  return { playRingtone, playDialTone, stopSound };
}
