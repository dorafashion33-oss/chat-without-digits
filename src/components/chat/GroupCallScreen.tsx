import { Phone, PhoneOff, Video as VideoIcon, VideoOff, Mic, MicOff, Users } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { formatDuration } from "@/hooks/useWebRTC";

interface GroupCallScreenProps {
  groupName: string;
  callType: "voice" | "video";
  duration: number;
  participants: Record<string, { userId: string; stream?: MediaStream }>;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

const RemoteTile = ({ stream, isVideo }: { stream?: MediaStream; isVideo: boolean }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [stream]);
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-800 flex items-center justify-center">
      {isVideo && stream ? (
        <video ref={ref} autoPlay playsInline className="h-full w-full object-cover" />
      ) : (
        <>
          {stream && <audio ref={ref as any} autoPlay />}
          <Users className="h-10 w-10 text-white/40" />
        </>
      )}
    </div>
  );
};

const GroupCallScreen = ({ groupName, callType, duration, participants, localVideoRef, onEnd, onToggleMute, onToggleVideo }: GroupCallScreenProps) => {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const participantList = Object.values(participants);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="text-center pt-6 pb-4 text-white">
        <h2 className="text-xl font-bold">{groupName}</h2>
        <p className="text-sm text-white/70 mt-1">{participantList.length + 1} on call · {formatDuration(duration)}</p>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto content-start">
        {/* Local */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-700 flex items-center justify-center">
          {callType === "video" ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <div className="text-white/60 text-xs">You</div>
          )}
          <span className="absolute bottom-1 left-2 text-[10px] text-white bg-black/40 px-1.5 rounded">You</span>
        </div>
        {participantList.map((p) => (
          <RemoteTile key={p.userId} stream={p.stream} isVideo={callType === "video"} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-5 py-6">
        <button onClick={() => { setMuted(!muted); onToggleMute(); }} className={`flex h-14 w-14 items-center justify-center rounded-full ${muted ? "bg-white text-gray-900" : "bg-white/20 text-white"}`}>
          {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
        {callType === "video" && (
          <button onClick={() => { setVideoOff(!videoOff); onToggleVideo(); }} className={`flex h-14 w-14 items-center justify-center rounded-full ${videoOff ? "bg-white text-gray-900" : "bg-white/20 text-white"}`}>
            {videoOff ? <VideoOff className="h-6 w-6" /> : <VideoIcon className="h-6 w-6" />}
          </button>
        )}
        <button onClick={onEnd} className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
          <PhoneOff className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
};

export default GroupCallScreen;
