import { useRef, useCallback, useEffect } from "react";

// Generate ringtone using Web Audio API
function createRingtone(ctx: AudioContext): OscillatorNode[] {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = "sine";
  osc1.frequency.value = 440;
  osc2.type = "sine";
  osc2.frequency.value = 480;
  
  gain.gain.value = 0.15;
  
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  
  // Ring pattern: 2s on, 4s off
  const now = ctx.currentTime;
  for (let i = 0; i < 10; i++) {
    const start = now + i * 6;
    gain.gain.setValueAtTime(0.15, start);
    gain.gain.setValueAtTime(0, start + 2);
  }
  
  osc1.start();
  osc2.start();
  
  return [osc1, osc2];
}

function createDialTone(ctx: AudioContext): OscillatorNode[] {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = "sine";
  osc.frequency.value = 425;
  gain.gain.value = 0.1;
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  // Ring-back pattern: 1s on, 3s off
  const now = ctx.currentTime;
  for (let i = 0; i < 15; i++) {
    const start = now + i * 4;
    gain.gain.setValueAtTime(0.1, start);
    gain.gain.setValueAtTime(0, start + 1);
  }
  
  osc.start();
  return [osc];
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
