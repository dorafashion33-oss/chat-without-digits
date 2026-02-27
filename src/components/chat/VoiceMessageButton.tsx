import { Mic, Square } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const VoiceMessageButton = () => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (recording) {
      setDuration(0);
      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [recording]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (recording) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-xs font-medium text-destructive">{formatTime(duration)}</span>
        <button
          onClick={() => setRecording(false)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-all hover:opacity-90"
        >
          <Square className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setRecording(true)}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:opacity-90"
    >
      <Mic className="h-4 w-4" />
    </button>
  );
};

export default VoiceMessageButton;
