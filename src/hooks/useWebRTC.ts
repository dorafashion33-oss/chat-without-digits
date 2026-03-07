import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const currentCallIdRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    clearInterval(durationIntervalRef.current);
    setCallDuration(0);
    setCallState("idle");
    setRemoteUserId(null);
    setRemoteProfile(null);
    currentCallIdRef.current = null;
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
        setCallState("connected");
        durationIntervalRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        cleanup();
      }
    };

    return pc;
  }, [currentUserId, cleanup]);

  const startCall = useCallback(async (targetUserId: string, type: CallType) => {
    if (!currentUserId) return;
    setCallType(type);
    setRemoteUserId(targetUserId);
    setCallState("calling");

    // Fetch remote profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", targetUserId).single();
    if (profile) setRemoteProfile(profile);

    const stream = await getMedia(type);
    if (!stream) { cleanup(); return; }

    const pc = createPC(targetUserId);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Signal via broadcast
    await supabase.channel("call-signaling").send({
      type: "broadcast",
      event: "call-offer",
      payload: { from: currentUserId, to: targetUserId, offer, callType: type },
    });
  }, [currentUserId, getMedia, createPC, cleanup]);

  const answerCall = useCallback(async (fromUserId: string, offer: RTCSessionDescriptionInit, type: CallType) => {
    if (!currentUserId) return;
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
  }, [currentUserId, getMedia, createPC, cleanup]);

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
          // Store offer for when user accepts
          (window as any).__pendingOffer = { from: data.from, offer: data.offer, type: data.callType };
        }
      })
      .on("broadcast", { event: "call-answer" }, async (payload) => {
        const data = payload.payload;
        if (data?.to === currentUserId && pcRef.current) {
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
  }, [currentUserId, callState, cleanup]);

  const acceptCall = useCallback(async () => {
    const pending = (window as any).__pendingOffer;
    if (pending) {
      await answerCall(pending.from, pending.offer, pending.type);
      delete (window as any).__pendingOffer;
    }
  }, [answerCall]);

  const rejectCall = useCallback(() => {
    if (remoteUserId && currentUserId) {
      supabase.channel("call-signaling").send({
        type: "broadcast",
        event: "call-end",
        payload: { from: currentUserId, to: remoteUserId },
      });
    }
    cleanup();
  }, [remoteUserId, currentUserId, cleanup]);

  return {
    callState, callType, remoteUserId, remoteProfile, callDuration,
    localVideoRef, remoteVideoRef,
    startCall, endCall, acceptCall, rejectCall,
    toggleMute, toggleVideo,
  };
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
