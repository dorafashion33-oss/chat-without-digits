import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { useState } from "react";
import type { CallState, CallType } from "@/hooks/useWebRTC";
import { formatDuration } from "@/hooks/useWebRTC";

interface CallScreenProps {
  callState: CallState;
  callType: CallType;
  remoteProfile: any;
  callDuration: number;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  isRemoteOnline?: boolean | null;
  onEndCall: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

const CallScreen = ({
  callState, callType, remoteProfile, callDuration,
  localVideoRef, remoteVideoRef, isRemoteOnline,
  onEndCall, onAccept, onReject, onToggleMute, onToggleVideo,
}: CallScreenProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const displayName = remoteProfile?.display_name || remoteProfile?.username || "Unknown";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleMute = () => { setIsMuted(!isMuted); onToggleMute(); };
  const handleVideo = () => { setIsVideoOff(!isVideoOff); onToggleVideo(); };

  const getCallingStatus = () => {
    if (callState === "calling") {
      if (isRemoteOnline) return "Ringing...";
      return "Calling...";
    }
    if (callState === "ringing") return "Incoming call...";
    if (callState === "connected") return formatDuration(callDuration);
    return "";
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gradient-to-b from-gray-900 to-black p-6">
      {/* Remote video (full screen bg) */}
      {callType === "video" && callState === "connected" && (
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
      )}

      {/* Local video (small pip) */}
      {callType === "video" && callState === "connected" && (
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-6 right-6 z-10 h-32 w-24 rounded-2xl object-cover border-2 border-white/30 shadow-xl" />
      )}

      {/* Top area */}
      <div className="z-10 flex flex-col items-center pt-12">
        {(callState !== "connected" || callType === "voice") && (
          <>
            {remoteProfile?.avatar_url ? (
              <img src={remoteProfile.avatar_url} alt={displayName} className="h-28 w-28 rounded-full object-cover ring-4 ring-white/20 shadow-2xl" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-4xl font-bold text-white ring-4 ring-white/20 shadow-2xl">
                {initials}
              </div>
            )}
            <h2 className="mt-6 text-2xl font-bold text-white">{displayName}</h2>
            <p className="mt-2 text-sm text-white/70">{getCallingStatus()}</p>
            
            {/* Calling animation dots */}
            {callState === "calling" && (
              <div className="mt-4 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-2 w-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
            )}

            {/* Ringing animation for incoming */}
            {callState === "ringing" && (
              <div className="mt-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-400 animate-ping" />
                <span className="text-xs text-green-400 animate-pulse">Incoming {callType} call</span>
              </div>
            )}
          </>
        )}

        {callState === "connected" && callType === "voice" && (
          <p className="mt-4 text-lg text-white/90 font-medium">{formatDuration(callDuration)}</p>
        )}
      </div>

      {/* Controls */}
      <div className="z-10 flex items-center gap-6 pb-12">
        {callState === "ringing" ? (
          <>
            <button onClick={onReject} className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors">
              <PhoneOff className="h-7 w-7" />
            </button>
            <button onClick={onAccept} className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors animate-pulse">
              <Phone className="h-7 w-7" />
            </button>
          </>
        ) : (
          <>
            <button onClick={handleMute} className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${isMuted ? "bg-white text-gray-900" : "bg-white/20 text-white"}`}>
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            {callType === "video" && (
              <button onClick={handleVideo} className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${isVideoOff ? "bg-white text-gray-900" : "bg-white/20 text-white"}`}>
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </button>
            )}
            <button onClick={onEndCall} className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors">
              <PhoneOff className="h-7 w-7" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CallScreen;
