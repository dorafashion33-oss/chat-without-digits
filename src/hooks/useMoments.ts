import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Moment {
  id: string;
  user_id: string;
  text: string | null;
  image_url: string | null;
  created_at: string;
  expires_at: string;
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useMoments(currentUserId: string | undefined) {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMoments = useCallback(async () => {
    const { data } = await supabase
      .from("moments")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch profiles for all moment users
      const userIds = [...new Set(data.map((m: any) => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
      const enriched = data.map((m: any) => ({
        ...m,
        profile: profileMap.get(m.user_id),
      }));
      setMoments(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMoments();

    const channel = supabase
      .channel("moments-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "moments" }, () => {
        fetchMoments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMoments]);

  const postMoment = useCallback(async (text: string, imageFile?: File) => {
    if (!currentUserId) return;
    let image_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${currentUserId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("moments").upload(path, imageFile);
      if (error) { toast.error("Image upload failed"); return; }
      const { data: urlData } = supabase.storage.from("moments").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("moments").insert({
      user_id: currentUserId,
      text: text || null,
      image_url,
    });

    if (error) toast.error("Failed to post moment");
    else toast.success("Moment posted! ✨");
  }, [currentUserId]);

  const deleteMoment = useCallback(async (momentId: string) => {
    await supabase.from("moments").delete().eq("id", momentId);
  }, []);

  return { moments, loading, postMoment, deleteMoment, refetch: fetchMoments };
}
