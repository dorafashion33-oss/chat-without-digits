export const GHOST_EFFECTS = [
  { id: "ghost", label: "👻 Ghost" },
  { id: "mafia", label: "🕶️ Deep Mafia" },
  { id: "robot", label: "🤖 Robot" },
  { id: "whisper", label: "💨 Whisper Echo" },
] as const;
export type GhostEffect = (typeof GHOST_EFFECTS)[number]["id"];
export const MAX_VOICE_SECONDS = 12;
const OUT_RATE = 8000;

/** Disguises a recorded voice fully in the browser (zero server cost) and returns a small WAV data URL. */
export async function disguiseVoice(blob: Blob, effect: GhostEffect): Promise<string> {
  const ctx = new AudioContext();
  const src = await ctx.decodeAudioData(await blob.arrayBuffer());
  ctx.close();
  const rate = effect === "ghost" ? 1.45 : effect === "mafia" ? 0.72 : effect === "whisper" ? 0.9 : 1;
  const dur = Math.min(src.duration, MAX_VOICE_SECONDS) / rate + (effect === "whisper" ? 0.8 : 0);
  const off = new OfflineAudioContext(1, Math.ceil(dur * OUT_RATE), OUT_RATE);
  const node = off.createBufferSource();
  node.buffer = src;
  node.playbackRate.value = rate;
  let out: AudioNode = node;
  if (effect === "robot") {
    const ring = off.createGain();
    ring.gain.value = 0;
    const osc = off.createOscillator();
    osc.frequency.value = 55;
    osc.connect(ring.gain);
    osc.start();
    node.connect(ring);
    out = ring;
  }
  if (effect === "mafia") {
    const lp = off.createBiquadFilter();
    lp.type = "lowshelf"; lp.frequency.value = 300; lp.gain.value = 8;
    out.connect(lp); out = lp;
  }
  const master = off.createGain();
  master.gain.value = 0.9;
  out.connect(master);
  if (effect === "whisper") {
    const delay = off.createDelay(); delay.delayTime.value = 0.18;
    const fb = off.createGain(); fb.gain.value = 0.45;
    master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(off.destination);
  }
  master.connect(off.destination);
  node.start(0, 0, Math.min(src.duration, MAX_VOICE_SECONDS));
  const rendered = await off.startRendering();
  return toWavDataUrl(rendered.getChannelData(0), OUT_RATE);
}

function toWavDataUrl(data: Float32Array, rate: number) {
  const buf = new ArrayBuffer(44 + data.length * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + data.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, data.length * 2, true);
  data.forEach((s, i) => v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true));
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:audio/wav;base64,${btoa(bin)}`;
}

export function parseVoice(text: string) {
  const m = /^\[voice:([a-z]+)\](data:audio\/.+)$/s.exec(text);
  return m ? { effect: m[1], src: m[2] } : null;
}
