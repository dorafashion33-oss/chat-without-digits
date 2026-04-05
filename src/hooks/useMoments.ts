import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MomentView {
  viewer_id: string;
  viewed_at: string;
  profile?: { username: string; display_name: string | null; avatar_url: string | null };
}

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
  views?: MomentView[];
  view_count?: number;
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
      const userIds = [...new Set(data.map((m: any) => m.user_id))];
      const momentIds = data.map((m: any) => m.id);

      // Fetch profiles and views in parallel
      const [profilesRes, viewsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, username, display_name, avatar_url").in("user_id", userIds),
        momentIds.length > 0
          ? supabase.from("moment_views").select("moment_id, viewer_id, viewed_at").in("moment_id", momentIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = new Map(profilesRes.data?.map((p: any) => [p.user_id, p]) || []);

      // Get all viewer profiles
      const viewerIds = [...new Set((viewsRes.data || []).map((v: any) => v.viewer_id))];
      let viewerProfileMap = new Map();
      if (viewerIds.length > 0) {
        const { data: viewerProfiles } = await supabase.from("profiles").select("user_id, username, display_name, avatar_url").in("user_id", viewerIds);
        viewerProfileMap = new Map(viewerProfiles?.map((p: any) => [p.user_id, p]) || []);
      }

      // Group views by moment
      const viewsByMoment = new Map<string, MomentView[]>();
      (viewsRes.data || []).forEach((v: any) => {
        if (!viewsByMoment.has(v.moment_id)) viewsByMoment.set(v.moment_id, []);
        viewsByMoment.get(v.moment_id)!.push({
          viewer_id: v.viewer_id,
          viewed_at: v.viewed_at,
          profile: viewerProfileMap.get(v.viewer_id),
        });
      });

      const enriched = data.map((m: any) => ({
        ...m,
        profile: profileMap.get(m.user_id),
        views: viewsByMoment.get(m.id) || [],
        view_count: (viewsByMoment.get(m.id) || []).length,
      }));
      setMoments(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMoments();
    const channel = supabase
      .channel("moments-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "moments" }, () => fetchMoments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchMoments]);

  const recordView = useCallback(async (momentId: string) => {
    if (!currentUserId) return;
    await supabase.from("moment_views").upsert(
      { moment_id: momentId, viewer_id: currentUserId },
      { onConflict: "moment_id,viewer_id" }
    );
    // Refresh to update counts
    fetchMoments();
  }, [currentUserId, fetchMoments]);

  const postMoment = useCallback(async (text: string, imageFile?: File) => {
    if (!currentUserId) return;
    let image_url: string | null = null;

    if (imageFile) {
      if (imageFile.size > 10 * 1024 * 1024) {
        toast.error("File too large. Max 10MB allowed.");
        return;
      }
      const ext = imageFile.name.split(".").pop() || "jpg";
      const path = `${currentUserId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("moments")
        .upload(path, imageFile, { cacheControl: "3600", upsert: false });
      if (uploadError) {
        toast.error("Image upload failed: " + uploadError.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("moments").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("moments").insert({
      user_id: currentUserId,
      text: text || null,
      image_url,
    });

    if (error) {
      toast.error("Failed to post moment");
    } else {
      toast.success("Moment posted! ✨");
      fetchMoments();
    }
  }, [currentUserId, fetchMoments]);

  const deleteMoment = useCallback(async (momentId: string) => {
    await supabase.from("moments").delete().eq("id", momentId);
  }, []);

  return { moments, loading, postMoment, deleteMoment, recordView, refetch: fetchMoments };
}
