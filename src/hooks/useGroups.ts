import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { username: string; display_name: string | null; avatar_url: string | null };
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  profile?: { username: string; display_name: string | null; avatar_url: string | null };
}

export function useGroups(currentUserId: string | undefined) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from("groups")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setGroups(data as Group[]);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = useCallback(async (name: string, description: string, memberIds: string[]) => {
    if (!currentUserId) return null;
    const { data: group, error } = await supabase
      .from("groups")
      .insert({ name, description, created_by: currentUserId })
      .select()
      .single();
    if (error || !group) { toast.error("Failed to create group"); return null; }

    // Add creator as admin
    const members = [
      { group_id: group.id, user_id: currentUserId, role: "admin" },
      ...memberIds.map((uid) => ({ group_id: group.id, user_id: uid, role: "member" })),
    ];
    await supabase.from("group_members").insert(members);
    toast.success("Group created! 🎉");
    fetchGroups();
    return group as Group;
  }, [currentUserId, fetchGroups]);

  const fetchGroupMessages = useCallback(async (groupId: string): Promise<GroupMessage[]> => {
    const { data: messages } = await supabase
      .from("group_messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    if (!messages) return [];
    const senderIds = [...new Set(messages.map((m: any) => m.sender_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", senderIds);

    const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
    return messages.map((m: any) => ({ ...m, profile: profileMap.get(m.sender_id) }));
  }, []);

  const sendGroupMessage = useCallback(async (groupId: string, text: string) => {
    if (!currentUserId || !text.trim()) return;
    await supabase.from("group_messages").insert({
      group_id: groupId,
      sender_id: currentUserId,
      text: text.trim(),
    });
  }, [currentUserId]);

  const fetchGroupMembers = useCallback(async (groupId: string): Promise<GroupMember[]> => {
    const { data: members } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId);
    if (!members) return [];
    const userIds = members.map((m: any) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", userIds);
    const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
    return members.map((m: any) => ({ ...m, profile: profileMap.get(m.user_id) }));
  }, []);

  const addMember = useCallback(async (groupId: string, userId: string) => {
    const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: userId });
    if (error) toast.error("Failed to add member");
    else toast.success("Member added!");
  }, []);

  const removeMember = useCallback(async (groupId: string, userId: string) => {
    await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
    toast.success("Member removed");
  }, []);

  const deleteGroup = useCallback(async (groupId: string) => {
    await supabase.from("groups").delete().eq("id", groupId);
    fetchGroups();
    toast.success("Group deleted");
  }, [fetchGroups]);

  return {
    groups, loading, createGroup, fetchGroupMessages, sendGroupMessage,
    fetchGroupMembers, addMember, removeMember, deleteGroup, refetch: fetchGroups,
  };
}
