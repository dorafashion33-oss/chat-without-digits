import { useState, useRef } from "react";
import { BarChart2, Play, Pause, Volume2, Ghost } from "lucide-react";
import { parseVoice, GHOST_EFFECTS } from "@/lib/ghostVoice";

interface MessageContentProps {
  text: string;
  isOwn?: boolean;
}

const MessageContent = ({ text }: MessageContentProps) => {
  // ─── 1. Ghost / Modulated Voice Notes [voice:effect]dataurl ───
  const parsedVoice = parseVoice(text);
  if (parsedVoice) {
    return <VoiceBubblePlayer audioSrc={parsedVoice.src} effectId={parsedVoice.effect} />;
  }

  // ─── 2. Standard Voice Note [voice]url|duration[/voice] or [voice]url[/voice] ───
  const standardVoiceMatch = text.match(/^\[voice\](.*?)(?:\|(.*?))?\[\/voice\]$/);
  if (standardVoiceMatch) {
    const [, audioUrl, durationSec] = standardVoiceMatch;
    return <VoiceBubblePlayer audioSrc={audioUrl} durationHint={durationSec} effectId="normal" />;
  }

  // ─── 3. Real In-Chat Interactive Polls [poll:id]Question|Opt1,Opt2|VotesJson[/poll] ───
  const pollMatch = text.match(/^\[poll:(.*?)\](.*?)\|(.*?)\|(.*?)\[\/poll\]$/);
  if (pollMatch) {
    const [, , question, optionsRaw, votesRaw] = pollMatch;
    const options = optionsRaw.split(",");
    let votesMap: Record<number, number> = {};
    try {
      votesMap = JSON.parse(votesRaw || "{}");
    } catch {}

    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
    const totalVotes = Object.values(votesMap).reduce((a, b) => a + b, 0) + (selectedOpt !== null ? 1 : 0);

    return (
      <div className="bz-card p-3.5 max-w-[280px] bg-white shadow-[0_2px_0_0_#0a0a0a]">
        <div className="flex items-center gap-1.5 mb-2 font-black text-xs text-[#0a0a0a]">
          <BarChart2 className="h-4 w-4 text-[#0a0a0a]" /> {question}
        </div>
        <div className="space-y-2">
          {options.map((opt, idx) => {
            const count = (votesMap[idx] || 0) + (selectedOpt === idx ? 1 : 0);
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOpt(idx)}
                className={`relative w-full rounded-lg border-2 border-[#0a0a0a] p-2 text-left text-xs font-bold overflow-hidden transition-all ${
                  selectedOpt === idx ? "bg-[#FFF6B8]" : "bg-white hover:bg-[#fffbec]"
                }`}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[#FCE314]/40 z-0 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full border border-[#0a0a0a] bg-white" />
                    {opt}
                  </span>
                  <span className="text-[10px] font-black">{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-[10px] font-bold text-[#0a0a0a]/60 text-right">
          {totalVotes} total {totalVotes === 1 ? "vote" : "votes"}
        </div>
      </div>
    );
  }

  // ─── 4. Image/Video/File Tags ───
  const imgMatch = text.match(/^\[img\](.*?)\[\/img\](?:\n([\s\S]*))?$/);
  if (imgMatch) {
    return (
      <div className="space-y-1.5">
        <img
          src={imgMatch[1]}
          alt="Attached media"
          className="max-h-64 rounded-xl border-2 border-[#0a0a0a] object-cover"
        />
        {imgMatch[2] && <p className="whitespace-pre-wrap break-words">{imgMatch[2]}</p>}
      </div>
    );
  }

  const vidMatch = text.match(/^\[video\](.*?)\[\/video\](?:\n([\s\S]*))?$/);
  if (vidMatch) {
    return (
      <div className="space-y-1.5">
        <video
          src={vidMatch[1]}
          controls
          className="max-h-64 rounded-xl border-2 border-[#0a0a0a]"
        />
        {vidMatch[2] && <p className="whitespace-pre-wrap break-words">{vidMatch[2]}</p>}
      </div>
    );
  }

  // ─── Regular plain text message ───
  return <p className="whitespace-pre-wrap break-words">{text}</p>;
};

// ─── Audio Bubble Player Component ───
function VoiceBubblePlayer({
  audioSrc,
  effectId = "normal",
  durationHint,
}: {
  audioSrc: string;
  effectId?: string;
  durationHint?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationHint ? Number(durationHint) : 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const effectLabel =
    effectId === "normal"
      ? "Voice Note"
      : GHOST_EFFECTS.find((e) => e.id === effectId)?.label || "Ghost Voice";

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!duration && audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-1.5 max-w-[260px] rounded-xl border-2 border-[#0a0a0a] bg-white p-2.5 shadow-[2px_2px_0_0_#0a0a0a]">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setPlaying(false);
          setCurrentTime(0);
        }}
        onLoadedMetadata={(e) => {
          const d = (e.target as HTMLAudioElement).duration;
          if (d && !isNaN(d)) setDuration(d);
        }}
      />

      <div className="flex items-center justify-between border-b border-[#0a0a0a]/10 pb-1">
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#0a0a0a]">
          {effectId === "normal" ? <Volume2 className="h-3 w-3" /> : <Ghost className="h-3 w-3" />}
          {effectLabel}
        </span>
        <span className="text-[9px] font-bold text-[#0a0a0a]/60">
          {formatSec(currentTime)} / {formatSec(duration || 6)}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={togglePlay}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[1px_1px_0_0_#0a0a0a] transition-all hover:bg-[#FFF6B8]"
        >
          {playing ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
        </button>

        <div className="flex flex-1 items-center gap-0.5 h-6 px-1">
          {[40, 75, 55, 90, 60, 100, 45, 80, 65, 95, 50, 70, 85, 40].map((h, i) => {
            const progress = duration > 0 ? (currentTime / duration) * 14 : 0;
            const isFilled = i <= progress;
            return (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isFilled ? "bg-[#0a0a0a]" : "bg-[#0a0a0a]/20"
                }`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MessageContent;
