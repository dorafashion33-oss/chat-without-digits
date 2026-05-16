import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallSounds } from "./useCallSounds";

export type GroupCallType = "voice" | "video";
export type GroupCallState = "idle" | "calling" | "ringing" | "connected";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

interface PeerInfo {
  userId: string;
  pc: RTCPeerConnection;
  stream?: MediaStream;
}

export function useGroupCall(currentUserId: string | undefined) {
  const [state, setState] = useState<GroupCallState>("idle");
  const [callType, setCallType] = useState<GroupCallType>("voice");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [participants, setParticipants] = useState<Record<string, { userId: string; stream?: MediaStream }>>({});
  const [incomingInvite, setIncomingInvite] = useState<{ groupId: string; from: string; type: GroupCallType; groupName: string } | null>(null);
  const [duration, setDuration] = useState(0);

  const peersRef = useRef<Map<string, PeerInfo>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const { playRingtone, playDialTone, stopSound } = useCallSounds();

  const updateParticipants = useCallback(() => {
    const next: Record<string, { userId: string; stream?: MediaStream }> = {};
    peersRef.current.forEach((p, id) => { next[id] = { userId: p.userId, stream: p.stream }; });
    setParticipants(next);
  }, []);

  const getMedia = useCallback(async (type: GroupCallType) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch {
      toast.error("Camera/microphone access denied");
      return null;
    }
  }, []);

  const createPeer = useCallback((remoteId: string, groupId: string, initiator: boolean) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const info: PeerInfo = { userId: remoteId, pc };
    peersRef.current.set(remoteId, info);

    localStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));

    pc.onicecandidate = (e) => {
      if (e.candidate && channelRef.current && currentUserId) {
        channelRef.current.send({
          type: "broadcast",
          event: "g-ice",
          payload: { groupId, from: currentUserId, to: remoteId, candidate: e.candidate },
        });
      }
    };

    pc.ontrack = (e) => {
      info.stream = e.streams[0];
      updateParticipants();
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        peersRef.current.delete(remoteId);
        updateParticipants();
      }
    };

    if (initiator) {
      (async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        channelRef.current?.send({
          type: "broadcast",
          event: "g-offer",
          payload: { groupId, from: currentUserId, to: remoteId, offer },
        });
      })();
    }

    return info;
  }, [currentUserId, updateParticipants]);

  const setupChannel = useCallback((groupId: string) => {
    const ch = supabase
      .channel(`group-call-${groupId}`)
      .on("broadcast", { event: "g-join" }, async (payload) => {
        const data = payload.payload;
        if (data?.groupId !== groupId || data.from === currentUserId) return;
        // Someone joined → initiate offer
        if (!peersRef.current.has(data.from) && localStreamRef.current) {
          createPeer(data.from, groupId, true);
        }
      })
      .on("broadcast", { event: "g-offer" }, async (payload) => {
        const data = payload.payload;
        if (data?.to !== currentUserId || data.groupId !== groupId) return;
        let peer = peersRef.current.get(data.from);
        if (!peer) peer = createPeer(data.from, groupId, false);
        await peer.pc.setRemoteDescription(data.offer);
        const answer = await peer.pc.createAnswer();
        await peer.pc.setLocalDescription(answer);
        channelRef.current?.send({
          type: "broadcast",
          event: "g-answer",
          payload: { groupId, from: currentUserId, to: data.from, answer },
        });
      })
      .on("broadcast", { event: "g-answer" }, async (payload) => {
        const data = payload.payload;
        if (data?.to !== currentUserId || data.groupId !== groupId) return;
        const peer = peersRef.current.get(data.from);
        if (peer) await peer.pc.setRemoteDescription(data.answer);
      })
      .on("broadcast", { event: "g-ice" }, async (payload) => {
        const data = payload.payload;
        if (data?.to !== currentUserId || data.groupId !== groupId) return;
        const peer = peersRef.current.get(data.from);
        if (peer) { try { await peer.pc.addIceCandidate(data.candidate); } catch {} }
      })
      .on("broadcast", { event: "g-leave" }, (payload) => {
        const data = payload.payload;
        if (data?.groupId !== groupId) return;
        const peer = peersRef.current.get(data.from);
        if (peer) { peer.pc.close(); peersRef.current.delete(data.from); updateParticipants(); }
      })
      .subscribe();
    channelRef.current = ch;
  }, [currentUserId, createPeer, updateParticipants]);

  const endGroupCall = useCallback(() => {
    stopSound();
    if (channelRef.current && activeGroupId && currentUserId) {
      channelRef.current.send({
        type: "broadcast",
        event: "g-leave",
        payload: { groupId: activeGroupId, from: currentUserId },
      });
    }
    peersRef.current.forEach((p) => p.pc.close());
    peersRef.current.clear();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = null;
    clearInterval(durationIntervalRef.current);
    setDuration(0);
    setActiveGroupId(null);
    setGroupName("");
    setParticipants({});
    setState("idle");
  }, [activeGroupId, currentUserId, stopSound]);

  const startGroupCall = useCallback(async (groupId: string, gName: string, memberIds: string[], type: GroupCallType) => {
    if (!currentUserId) return;
    const stream = await getMedia(type);
    if (!stream) return;
    setCallType(type);
    setActiveGroupId(groupId);
    setGroupName(gName);
    setState("connected");
    setupChannel(groupId);
    playDialTone();
    durationIntervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

    // Invite members via group-invites channel
    await supabase.channel("group-call-invites").send({
      type: "broadcast",
      event: "g-invite",
      payload: { groupId, groupName: gName, from: currentUserId, members: memberIds, type },
    });

    // Announce join so existing peers initiate
    setTimeout(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "g-join",
        payload: { groupId, from: currentUserId },
      });
    }, 500);
  }, [currentUserId, getMedia, setupChannel, playDialTone]);

  const acceptInvite = useCallback(async () => {
    if (!incomingInvite || !currentUserId) return;
    stopSound();
    const { groupId, type, groupName: gn } = incomingInvite;
    const stream = await getMedia(type);
    if (!stream) { setIncomingInvite(null); return; }
    setCallType(type);
    setActiveGroupId(groupId);
    setGroupName(gn);
    setState("connected");
    setupChannel(groupId);
    durationIntervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    setIncomingInvite(null);
    // Announce join
    setTimeout(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "g-join",
        payload: { groupId, from: currentUserId },
      });
    }, 500);
  }, [incomingInvite, currentUserId, getMedia, setupChannel, stopSound]);

  const rejectInvite = useCallback(() => {
    stopSound();
    setIncomingInvite(null);
  }, [stopSound]);

  const toggleMute = useCallback(() => {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) t.enabled = !t.enabled;
  }, []);
  const toggleVideo = useCallback(() => {
    const t = localStreamRef.current?.getVideoTracks()[0];
    if (t) t.enabled = !t.enabled;
  }, []);

  // Global invite listener
  useEffect(() => {
    if (!currentUserId) return;
    const ch = supabase
      .channel("group-call-invites")
      .on("broadcast", { event: "g-invite" }, (payload) => {
        const data = payload.payload;
        if (data?.members?.includes(currentUserId) && data.from !== currentUserId && state === "idle") {
          setIncomingInvite({ groupId: data.groupId, from: data.from, type: data.type, groupName: data.groupName });
          playRingtone();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [currentUserId, state, playRingtone]);

  return {
    state, callType, activeGroupId, groupName, participants, duration,
    incomingInvite, localVideoRef,
    startGroupCall, endGroupCall, acceptInvite, rejectInvite,
    toggleMute, toggleVideo,
  };
}
