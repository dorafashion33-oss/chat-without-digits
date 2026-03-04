import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbMessage = Tables<"messages">;
export type DbProfile = Tables<"profiles">;

export interface ChatThread {
  id: string;
  profile: DbProfile;
  messages: DbMessage[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export function useRealtimeMessages(currentUserId: string | undefined) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const buildThreads = useCallback(
    (messages: DbMessage[], allProfiles: DbProfile[]) => {
      if (!currentUserId) return [];
      const threadMap = new Map<string, DbMessage[]>();

      for (const msg of messages) {
        const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        if (!threadMap.has(otherId)) threadMap.set(otherId, []);
        threadMap.get(otherId)!.push(msg);
      }

      const result: ChatThread[] = [];
      for (const [otherId, msgs] of threadMap) {
        const sorted = msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const last = sorted[sorted.length - 1];
        const profile = allProfiles.find((p) => p.user_id === otherId);
        if (!profile) continue;
        const unread = sorted.filter((m) => m.sender_id !== currentUserId && !m.read_at).length;
        result.push({ id: otherId, profile, messages: sorted, lastMessage: last.text, lastMessageTime: formatTime(last.created_at), unreadCount: unread });
      }

      result.sort((a, b) => {
        const aTime = new Date(a.messages[a.messages.length - 1].created_at).getTime();
        const bTime = new Date(b.messages[b.messages.length - 1].created_at).getTime();
        return bTime - aTime;
      });

      return result;
    },
    [currentUserId]
  );

  const fetchMessages = useCallback(async () => {
    if (!currentUserId) return;
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order("created_at", { ascending: true });

    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", currentUserId);

    if (profs) setProfiles(profs);
    if (messages && profs) {
      setThreads(buildThreads(messages, profs));
    }
    setLoading(false);
  }, [currentUserId, buildThreads]);

  // Subscribe to realtime messages + typing broadcast
  useEffect(() => {
    if (!currentUserId) return;

    fetchMessages();

    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        fetchMessages();
      })
      .subscribe();

    // Typing indicator channel
    const typingChannel = supabase
      .channel("typing-indicators")
      .on("broadcast", { event: "typing" }, (payload) => {
        const senderId = payload.payload?.user_id;
        if (senderId && senderId !== currentUserId) {
          setTypingUsers((prev) => new Set(prev).add(senderId));
          // Auto-remove after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) => {
              const next = new Set(prev);
              next.delete(senderId);
              return next;
            });
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
    };
  }, [currentUserId, fetchMessages]);

  const sendMessage = useCallback(
    async (receiverId: string, text: string) => {
      if (!currentUserId || !text.trim()) return;
      await supabase.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        text: text.trim(),
      });
    },
    [currentUserId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!currentUserId) return;
      await supabase.from("messages").delete().eq("id", messageId).eq("sender_id", currentUserId);
    },
    [currentUserId]
  );

  const editMessage = useCallback(
    async (messageId: string, newText: string) => {
      if (!currentUserId || !newText.trim()) return;
      // We update as sender
      await supabase.from("messages").update({ text: newText.trim() }).eq("id", messageId).eq("sender_id", currentUserId);
    },
    [currentUserId]
  );

  const markAsRead = useCallback(
    async (senderId: string) => {
      if (!currentUserId) return;
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", senderId)
        .eq("receiver_id", currentUserId)
        .is("read_at", null);
    },
    [currentUserId]
  );

  const sendTyping = useCallback(
    async (receiverId: string) => {
      if (!currentUserId) return;
      await supabase.channel("typing-indicators").send({
        type: "broadcast",
        event: "typing",
        payload: { user_id: currentUserId, receiver_id: receiverId },
      });
    },
    [currentUserId]
  );

  return {
    threads,
    profiles,
    loading,
    sendMessage,
    deleteMessage,
    editMessage,
    markAsRead,
    sendTyping,
    typingUsers,
    refetch: fetchMessages,
  };
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}
