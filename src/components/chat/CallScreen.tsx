import { Ellipsis, Mic, MicOff, Phone, PhoneOff, UserRoundPlus, Video, VideoOff } from "lucide-react";
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
  const displayName = remoteProfile?.display_name || remoteProfile?.username || "Buzz user";
  const initials = displayName.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
  const status = callState === "calling" ? (isRemoteOnline ? "Ringing…" : "Calling…") : callState === "ringing" ? `Incoming ${callType} call` : formatDuration(callDuration);
  const toggleMute = () => { setIsMuted((value) => !value); onToggleMute(); };
  const toggleVideo = () => { setIsVideoOff((value) => !value); onToggleVideo(); };
  const controlClass = "h-12 w-12 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20";

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-call-surface text-primary-foreground">
      {callType === "video" && callState === "connected" && <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-b from-call-surface/55 via-transparent to-call-surface/60" />

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pb-6 pt-[max(20px,env(safe-area-inset-top))] low-fade">
        <span className="text-xs font-medium">End-to-end encrypted</span>
        <Button variant="ghost" size="icon" className="rounded-full text-primary-foreground hover:bg-primary-foreground/10" aria-label="Add participant"><UserRoundPlus /></Button>
      </div>

      {(callState !== "connected" || callType === "voice") && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-28 text-center low-fade">
          {remoteProfile?.avatar_url ? <img src={remoteProfile.avatar_url} alt={displayName} className="h-28 w-28 rounded-full object-cover ring-4 ring-primary-foreground/20 shadow-2xl" /> : <div className="gradient-brand flex h-28 w-28 items-center justify-center rounded-full text-4xl font-bold ring-4 ring-primary-foreground/20 shadow-2xl">{initials}</div>}
          <h2 className="mt-6 text-2xl font-bold">{displayName}</h2>
          <p className="mt-2 text-sm text-primary-foreground/70">{status}</p>
        </div>
      )}

      {callType === "video" && callState === "connected" && <video ref={localVideoRef} autoPlay playsInline muted className="absolute right-4 top-20 z-20 aspect-[3/4] w-24 rounded-md border border-primary-foreground/20 object-cover shadow-xl sm:w-28" />}

      {callState === "ringing" ? (
        <div className="absolute inset-x-0 bottom-10 z-30 flex justify-center gap-12">
          <Button variant="destructive" size="icon" onClick={onReject} className="h-16 w-16 rounded-full shadow-xl" aria-label="Decline call"><PhoneOff className="h-7 w-7" /></Button>
          <Button size="icon" onClick={onAccept} className="h-16 w-16 rounded-full bg-online text-primary-foreground shadow-xl hover:bg-online/90" aria-label="Accept call"><Phone className="h-7 w-7" /></Button>
        </div>
      ) : (
        <div className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 z-30 flex w-[calc(100%-32px)] max-w-sm -translate-x-1/2 items-center justify-around rounded-[22px] border border-primary-foreground/10 bg-call-surface/85 px-3 py-3 shadow-2xl backdrop-blur-xl low-fade-delay">
          <Button variant="ghost" size="icon" className={controlClass} aria-label="More call options"><Ellipsis /></Button>
          <Button variant="ghost" size="icon" onClick={toggleVideo} className={`${controlClass} ${isVideoOff ? "bg-call-active text-call-surface" : ""}`} aria-label={isVideoOff ? "Turn camera on" : "Turn camera off"}>{isVideoOff ? <VideoOff /> : <Video />}</Button>
          <Button variant="ghost" size="icon" onClick={toggleMute} className={`${controlClass} ${isMuted ? "bg-call-active text-call-surface" : ""}`} aria-label={isMuted ? "Unmute" : "Mute"}>{isMuted ? <MicOff /> : <Mic />}</Button>
          <Button variant="destructive" size="icon" onClick={onEndCall} className="h-12 w-12 rounded-full shadow-lg" aria-label="End call"><PhoneOff /></Button>
        </div>
      )}
    </div>
  );
};

export default CallScreen;