import { LockKeyhole, Mic, MicOff, Phone, PhoneOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CallState, CallType } from "@/hooks/useWebRTC";
import { formatDuration } from "@/hooks/useWebRTC";

interface CallScreenProps {
  callState: CallState;
  callType: CallType;
  remoteProfile: { display_name?: string; username?: string; avatar_url?: string } | null;
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

const CallScreen = ({ callState, callType, remoteProfile, callDuration, localVideoRef, remoteVideoRef, isRemoteOnline, onEndCall, onAccept, onReject, onToggleMute, onToggleVideo }: CallScreenProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const displayName = remoteProfile?.display_name || remoteProfile?.username || "Buzz user";
  const initials = displayName.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
  const status = callState === "calling" ? (isRemoteOnline ? "Ringing…" : "Calling…") : callState === "ringing" ? `Incoming ${callType} call` : formatDuration(callDuration);
  const toggleMute = () => { setIsMuted((value) => !value); onToggleMute(); };
  const toggleVideo = () => { setIsVideoOff((value) => !value); onToggleVideo(); };
  const toggleSpeaker = () => setSpeakerOff((v) => { const n = !v; if (remoteVideoRef.current) remoteVideoRef.current.muted = n; return n; });
  const isVideoCall = callType === "video";

  const Control = ({ onClick, active, label, children }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) => (
    <div className="flex flex-col items-center gap-1.5">
      <Button variant="ghost" size="icon" onClick={onClick} aria-label={label} aria-pressed={active}
        className={`h-14 w-14 rounded-full transition-all duration-200 active:scale-90 [&_svg]:h-6 [&_svg]:w-6 ${active ? "bg-primary-foreground text-call-surface hover:bg-primary-foreground/90" : "bg-primary-foreground/12 text-primary-foreground hover:bg-primary-foreground/20"}`}>
        {children}
      </Button>
      <span className="text-[11px] font-medium text-primary-foreground/75">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-call-surface text-primary-foreground">
      {/* Remote media: visible for video, hidden (audio only) for voice */}
      <video ref={remoteVideoRef} autoPlay playsInline className={isVideoCall && callState === "connected" ? "absolute inset-0 h-full w-full object-cover" : "hidden"} />
      <div className="absolute inset-0 bg-gradient-to-b from-call-surface/55 via-transparent to-call-surface/70" />

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-center px-5 pb-6 pt-[max(20px,env(safe-area-inset-top))] low-fade">
        <span className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium backdrop-blur"><LockKeyhole className="h-3.5 w-3.5" /> End-to-end encrypted</span>
      </div>

      {(callState !== "connected" || !isVideoCall) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-36 text-center low-fade">
          <div className="relative">
            {callState !== "connected" && isRemoteOnline !== false && <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />}
            {remoteProfile?.avatar_url ? <img src={remoteProfile.avatar_url} alt={displayName} className="relative h-32 w-32 rounded-full object-cover ring-4 ring-primary-foreground/20 shadow-2xl" /> : <div className="gradient-brand relative flex h-32 w-32 items-center justify-center rounded-full text-4xl font-bold ring-4 ring-primary-foreground/20 shadow-2xl">{initials}</div>}
          </div>
          <h2 className="mt-6 text-2xl font-bold">{displayName}</h2>
          <p className="mt-2 text-sm text-primary-foreground/70">{status}</p>
          {callState === "calling" && !isRemoteOnline && <p className="mt-1 text-xs text-primary-foreground/50">Their phone may be offline</p>}
        </div>
      )}

      {isVideoCall && <video ref={localVideoRef} autoPlay playsInline muted className={callState === "connected" ? "absolute right-4 top-20 z-20 aspect-[3/4] w-24 rounded-xl border border-primary-foreground/20 object-cover shadow-xl sm:w-32" : "hidden"} />}

      {callState === "ringing" ? (
        <div className="absolute inset-x-0 bottom-12 z-30 flex justify-center gap-16">
          <div className="flex flex-col items-center gap-2"><Button variant="destructive" size="icon" onClick={onReject} className="h-16 w-16 rounded-full shadow-xl active:scale-90 [&_svg]:h-7 [&_svg]:w-7" aria-label="Decline call"><PhoneOff /></Button><span className="text-xs">Decline</span></div>
          <div className="flex flex-col items-center gap-2"><Button size="icon" onClick={onAccept} className="h-16 w-16 animate-bounce rounded-full bg-online text-primary-foreground shadow-xl hover:bg-online/90 [&_svg]:h-7 [&_svg]:w-7" aria-label="Accept call">{isVideoCall ? <Video /> : <Phone />}</Button><span className="text-xs">Accept</span></div>
        </div>
      ) : (
        <div className="absolute bottom-[max(20px,env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-[28px] border border-primary-foreground/10 bg-call-surface/80 px-4 pb-5 pt-4 shadow-2xl backdrop-blur-xl low-fade-delay">
          <div className="flex items-start justify-around">
            <Control onClick={toggleSpeaker} active={speakerOff} label={speakerOff ? "Speaker off" : "Speaker"}>{speakerOff ? <VolumeX /> : <Volume2 />}</Control>
            {isVideoCall && <Control onClick={toggleVideo} active={isVideoOff} label={isVideoOff ? "Camera off" : "Camera"}>{isVideoOff ? <VideoOff /> : <Video />}</Control>}
            <Control onClick={toggleMute} active={isMuted} label={isMuted ? "Muted" : "Mute"}>{isMuted ? <MicOff /> : <Mic />}</Control>
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="destructive" size="icon" onClick={onEndCall} className="h-14 w-14 rounded-full shadow-lg active:scale-90 [&_svg]:h-6 [&_svg]:w-6" aria-label="End call"><PhoneOff /></Button>
              <span className="text-[11px] font-medium text-primary-foreground/75">End</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallScreen;