import { Ellipsis, LockKeyhole, Mic, MicOff, Users, Video as VideoIcon, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/hooks/useWebRTC";

interface GroupCallScreenProps { groupName: string; callType: "voice" | "video"; duration: number; participants: Record<string, { userId: string; stream?: MediaStream }>; localVideoRef: React.RefObject<HTMLVideoElement>; onEnd: () => void; onToggleMute: () => void; onToggleVideo: () => void; }

const RemoteTile = ({ stream, isVideo }: { stream?: MediaStream; isVideo: boolean }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [stream]);
  return <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-call-control">{isVideo && stream ? <video ref={ref} autoPlay playsInline className="h-full w-full object-cover" /> : <><Users className="h-10 w-10 text-primary-foreground/40" />{stream && <audio ref={ref as React.RefObject<HTMLAudioElement>} autoPlay />}</>}</div>;
};

const GroupCallScreen = ({ groupName, callType, duration, participants, localVideoRef, onEnd, onToggleMute, onToggleVideo }: GroupCallScreenProps) => {
  const [muted, setMuted] = useState(false); const [videoOff, setVideoOff] = useState(false); const list = Object.values(participants);
  const controlClass = "h-12 w-12 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20";
  return <div className="fixed inset-0 z-[100] flex flex-col bg-call-surface p-4 text-primary-foreground">
    <div className="pb-4 pt-[max(16px,env(safe-area-inset-top))] text-center low-fade"><p className="flex items-center justify-center gap-2 text-xs text-primary-foreground/70"><LockKeyhole className="h-4 w-4" /> End-to-end encrypted</p><h2 className="mt-2 text-xl font-bold">{groupName}</h2><p className="mt-1 text-sm text-primary-foreground/70">{list.length + 1} on call · {formatDuration(duration)}</p></div>
    <div className="grid flex-1 content-center grid-cols-2 gap-2 overflow-y-auto sm:gap-3"><div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-call-control">{callType === "video" ? <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" /> : <span className="text-sm text-primary-foreground/70">You</span>}<span className="absolute bottom-2 left-2 rounded-sm bg-call-surface/70 px-2 py-1 text-[10px]">You</span></div>{list.map((participant) => <RemoteTile key={participant.userId} stream={participant.stream} isVideo={callType === "video"} />)}</div>
    <div className="mx-auto mt-4 flex w-full max-w-sm items-start justify-around rounded-[28px] border border-primary-foreground/10 bg-call-control/70 px-4 pb-4 pt-3 backdrop-blur-xl">{callType === "video" && <div className="flex flex-col items-center gap-1.5"><Button variant="ghost" size="icon" onClick={() => { setVideoOff(!videoOff); onToggleVideo(); }} className={`${controlClass} ${videoOff ? "bg-primary-foreground text-call-surface" : ""}`} aria-label="Toggle camera">{videoOff ? <VideoOff /> : <VideoIcon />}</Button><span className="text-[11px] text-primary-foreground/75">Camera</span></div>}<div className="flex flex-col items-center gap-1.5"><Button variant="ghost" size="icon" onClick={() => { setMuted(!muted); onToggleMute(); }} className={`${controlClass} ${muted ? "bg-primary-foreground text-call-surface" : ""}`} aria-label="Toggle microphone">{muted ? <MicOff /> : <Mic />}</Button><span className="text-[11px] text-primary-foreground/75">{muted ? "Muted" : "Mute"}</span></div><div className="flex flex-col items-center gap-1.5"><Button variant="destructive" size="icon" onClick={onEnd} className="h-14 w-14 rounded-full active:scale-90 [&_svg]:h-6 [&_svg]:w-6" aria-label="End group call"><PhoneOff /></Button><span className="text-[11px] text-primary-foreground/75">End</span></div></div>
  </div>;
};

export default GroupCallScreen;