import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallSounds } from "./useCallSounds";

export type CallState = "idle" | "calling" | "ringing" | "connected" | "ended";
export type CallType = "voice" | "video";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function useWebRTC(currentUserId: string | undefined) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [callType, setCallType] = useState<CallType>("voice");
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
  const [remoteProfile, setRemoteProfile] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isRemoteOnline, setIsRemoteOnline] = useState<boolean | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const currentCallIdRef = useRef<string | null>(null);
  const callingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { playRingtone, playDialTone, stopSound } = useCallSounds();

  const cleanup = useCallback(() => {
    stopSound();
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    clearInterval(durationIntervalRef.current);
    clearTimeout(callingTimeoutRef.current);
    setCallDuration(0);
    setCallState("idle");
    setRemoteUserId(null);
    setRemoteProfile(null);
    setIsRemoteOnline(null);
    currentCallIdRef.current = null;
  }, [stopSound]);

  const requestPermission = useCallback(async (type: CallType): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      // Permission granted, stop tracks immediately (we'll re-acquire later)
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      toast.error(type === "video" 
        ? "Camera aur microphone ki permission deni hogi call ke liye" 
        : "Microphone ki permission deni hogi call ke liye");
      return false;
    }
  }, []);

  const getMedia = useCallback(async (type: CallType) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch {
      toast.error("Camera/microphone access denied");
      return null;
    }
  }, []);

  const createPC = useCallback((remoteId: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.onicecandidate = async (e) => {
      if (e.candidate && currentUserId) {
        await supabase.channel("call-signaling").send({
          type: "broadcast",
          event: "ice-candidate",
          payload: { from: currentUserId, to: remoteId, candidate: e.candidate },
        });
      }
    };

    pc.ontrack = (e) => {
      remoteStreamRef.current = e.streams[0];
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        stopSound();
        setCallState("connected");
        durationIntervalRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        cleanup();
      }
    };

    return pc;
  }, [currentUserId, cleanup, stopSound]);

  const startCall = useCallback(async (targetUserId: string, type: CallType) => {
    if (!currentUserId) return;

    // Ask permission first
    const hasPermission = await requestPermission(type);
    if (!hasPermission) return;

    setCallType(type);
    setRemoteUserId(targetUserId);
    setCallState("calling");

    // Check if remote user is online
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", targetUserId).single();
    if (profile) {
      setRemoteProfile(profile);
      setIsRemoteOnline(profile.is_online ?? false);
      
      if (profile.is_online) {
        // User online → play dial tone (ring-back)
        playDialTone();
      }
      // If offline, no sound — just show "Calling..."
    }

    const stream = await getMedia(type);
    if (!stream) { cleanup(); return; }

    const pc = createPC(targetUserId);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await supabase.channel("call-signaling").send({
      type: "broadcast",
      event: "call-offer",
      payload: { from: currentUserId, to: targetUserId, offer, callType: type },
    });

    // Auto-end call after 45 seconds if no answer
    callingTimeoutRef.current = setTimeout(() => {
      if (pcRef.current?.connectionState !== "connected") {
        toast.info("No answer");
        cleanup();
      }
    }, 45000);
  }, [currentUserId, getMedia, createPC, cleanup, requestPermission, playDialTone]);

  const answerCall = useCallback(async (fromUserId: string, offer: RTCSessionDescriptionInit, type: CallType) => {
    if (!currentUserId) return;
    stopSound();
    setCallType(type);
    setRemoteUserId(fromUserId);
    setCallState("connected");

    const stream = await getMedia(type);
    if (!stream) { cleanup(); return; }

    const pc = createPC(fromUserId);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await supabase.channel("call-signaling").send({
      type: "broadcast",
      event: "call-answer",
      payload: { from: currentUserId, to: fromUserId, answer },
    });
  }, [currentUserId, getMedia, createPC, cleanup, stopSound]);

  const endCall = useCallback(() => {
    if (remoteUserId && currentUserId) {
      supabase.channel("call-signaling").send({
        type: "broadcast",
        event: "call-end",
        payload: { from: currentUserId, to: remoteUserId },
      });
    }
    cleanup();
  }, [remoteUserId, currentUserId, cleanup]);

  const toggleMute = useCallback(() => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
  }, []);

  const toggleVideo = useCallback(() => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
  }, []);

  // Listen for incoming calls
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("call-signaling")
      .on("broadcast", { event: "call-offer" }, async (payload) => {
        const data = payload.payload;
        if (data?.to === currentUserId && callState === "idle") {
          const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", data.from).single();
          setRemoteProfile(profile);
          setRemoteUserId(data.from);
          setCallType(data.callType || "voice");
          setCallState("ringing");
          playRingtone(); // Play ringtone for incoming call
          (window as any).__pendingOffer = { from: data.from, offer: data.offer, type: data.callType };
        }
      })
      .on("broadcast", { event: "call-answer" }, async (payload) => {
        const data = payload.payload;
        if (data?.to === currentUserId && pcRef.current) {
          stopSound(); // Stop dial tone when answered
          await pcRef.current.setRemoteDescription(data.answer);
        }
      })
      .on("broadcast", { event: "ice-candidate" }, async (payload) => {
        const data = payload.payload;
        if (data?.to === currentUserId && pcRef.current) {
          try {
            await pcRef.current.addIceCandidate(data.candidate);
          } catch {}
        }
      })
      .on("broadcast", { event: "call-end" }, (payload) => {
        const data = payload.payload;
        if (data?.to === currentUserId) {
          cleanup();
          toast.info("Call ended");
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, callState, cleanup, playRingtone, stopSound]);

  const acceptCall = useCallback(async () => {
    stopSound();
    const pending = (window as any).__pendingOffer;
    if (pending) {
      await answerCall(pending.from, pending.offer, pending.type);
      delete (window as any).__pendingOffer;
    }
  }, [answerCall, stopSound]);

  const rejectCall = useCallback(() => {
    stopSound();
    if (remoteUserId && currentUserId) {
      supabase.channel("call-signaling").send({
        type: "broadcast",
        event: "call-end",
        payload: { from: currentUserId, to: remoteUserId },
      });
    }
    cleanup();
  }, [remoteUserId, currentUserId, cleanup, stopSound]);

  return {
    callState, callType, remoteUserId, remoteProfile, callDuration,
    localVideoRef, remoteVideoRef, isRemoteOnline,
    startCall, endCall, acceptCall, rejectCall,
    toggleMute, toggleVideo,
  };
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
