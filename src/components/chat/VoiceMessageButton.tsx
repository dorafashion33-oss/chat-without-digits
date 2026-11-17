import { useState, useRef, useEffect } from "react";
import { Mic, Square, Sparkles, Send, Play, Pause, X, Volume2 } from "lucide-react";
import { disguiseVoice, GHOST_EFFECTS, MAX_VOICE_SECONDS, type GhostEffect } from "@/lib/ghostVoice";
import { toast } from "sonner";

interface VoiceMessageButtonProps {
  receiverId?: string;
  onSendVoice?: (voiceUrl: string, durationSecOrEffect?: string | number) => void;
}

const ALL_VOICE_EFFECTS = [
  { id: "normal", label: "🎙️ Normal Voice", desc: "Original voice clarity" },
  { id: "ghost", label: "👻 Ghost Filter", desc: "1.45x high-pitch phantom" },
  { id: "mafia", label: "🕶️ Deep Mafia", desc: "Heavy bass sub-woofer tone" },
  { id: "robot", label: "🤖 Cyber Robot", desc: "55Hz ring modulator" },
  { id: "whisper", label: "💨 Whisper Echo", desc: "Delay & feedback mystery" },
] as const;

export default function VoiceMessageButton({ onSendVoice }: VoiceMessageButtonProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<string>("normal");
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setPreviewUrl(null);
      setVoiceBlob(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const chunks: Blob[] = [];

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        setVoiceBlob(blob);
        setShowFilterPicker(true);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      rec.start();
      mediaRecRef.current = rec;
      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= MAX_VOICE_SECONDS - 1) {
            stopRecording();
            return MAX_VOICE_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      toast.error("Microphone permission required for voice notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecRef.current && mediaRecRef.current.state === "recording") {
      mediaRecRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSendProcessedVoice = async (effectId: string) => {
    if (!voiceBlob) return;
    setBusy(true);
    try {
      let finalAudioUrl = "";
      if (effectId === "normal") {
        finalAudioUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(voiceBlob);
        });
        onSendVoice?.(finalAudioUrl, "normal");
      } else {
        finalAudioUrl = await disguiseVoice(voiceBlob, effectId as GhostEffect);
        onSendVoice?.(finalAudioUrl, effectId);
      }
      toast.success(
        effectId === "normal"
          ? "Voice note sent!"
          : `Sent with ${ALL_VOICE_EFFECTS.find((e) => e.id === effectId)?.label}!`
      );
      cancelVoice();
    } catch {
      toast.error("Failed to process voice note.");
    } finally {
      setBusy(false);
    }
  };

  const cancelVoice = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setVoiceBlob(null);
    setShowFilterPicker(false);
    setPreviewUrl(null);
    setRecording(false);
    setSeconds(0);
  };

  const togglePlayPreview = () => {
    if (!voiceBlob) return;
    if (!previewUrl) {
      const url = URL.createObjectURL(voiceBlob);
      setPreviewUrl(url);
      const audio = new Audio(url);
      audioPreviewRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    } else if (audioPreviewRef.current) {
      if (isPlaying) {
        audioPreviewRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPreviewRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (recording ? stopRecording() : startRecording())}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#0a0a0a] shadow-[2px_2px_0_0_#0a0a0a] transition-all ${
          recording ? "bg-red-500 text-white animate-pulse" : "bg-white text-[#0a0a0a] hover:bg-[#FFF6B8]"
        }`}
        title={recording ? "Stop Recording" : "Voice Note (Ghost Modes)"}
      >
        {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>

      {showFilterPicker && voiceBlob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border-2 border-[#0a0a0a] bg-[#FFFDF7] p-5 shadow-[5px_5px_0_0_#0a0a0a] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-[#FCE314] shadow-[1px_1px_0_0_#0a0a0a]">
                  <Sparkles className="h-4 w-4 text-[#0a0a0a]" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                    Select Voice Mode
                  </h3>
                  <p className="text-[10px] font-bold text-[#0a0a0a]/60">Recorded ({seconds || 1}s)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={cancelVoice}
                className="grid h-7 w-7 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white hover:bg-red-100"
              >
                <X className="h-3.5 w-3.5 text-[#0a0a0a]" />
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between rounded-xl border-2 border-[#0a0a0a] bg-white p-2 shadow-[2px_2px_0_0_#0a0a0a]">
              <button
                type="button"
                onClick={togglePlayPreview}
                className="flex items-center gap-1.5 rounded-lg border-2 border-[#0a0a0a] bg-[#FFF6B8] px-2.5 py-1 text-xs font-black text-[#0a0a0a] shadow-[1px_1px_0_0_#0a0a0a]"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isPlaying ? "Pause" : "Listen Preview"}
              </button>
              <span className="text-[11px] font-black text-[#0a0a0a]/70 flex items-center gap-1">
                <Volume2 className="h-3.5 w-3.5" /> Web Audio DSP
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {ALL_VOICE_EFFECTS.map((eff) => {
                const isSelected = selectedEffect === eff.id;
                return (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() => setSelectedEffect(eff.id)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 border-[#0a0a0a] p-2.5 text-left transition-all ${
                      isSelected
                        ? "bg-[#FCE314] shadow-[3px_3px_0_0_#0a0a0a] -translate-y-0.5"
                        : "bg-white shadow-[1px_1px_0_0_#0a0a0a] hover:bg-[#fffbec]"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black text-[#0a0a0a]">{eff.label}</p>
                      <p className="text-[10px] font-bold text-[#0a0a0a]/60">{eff.desc}</p>
                    </div>
                    {isSelected && (
                      <span className="rounded-md border border-[#0a0a0a] bg-[#0a0a0a] px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelVoice}
                className="flex-1 rounded-xl border-2 border-[#0a0a0a] bg-white py-2 text-xs font-black uppercase text-[#0a0a0a] shadow-[2px_2px_0_0_#0a0a0a] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleSendProcessedVoice(selectedEffect)}
                className="flex-[2] flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#0a0a0a] bg-[#0a0a0a] py-2 text-xs font-black uppercase text-white shadow-[2px_2px_0_0_#0a0a0a] transition-all hover:bg-[#222]"
              >
                <Send className="h-3.5 w-3.5" />
                {busy ? "Converting..." : "Convert & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
