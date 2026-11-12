import { supabase } from "@/integrations/supabase/client";

const CLEANUP_KEY = "buzz:last-storage-cleanup";
const CLEANUP_INTERVAL_MS = 12 * 60 * 60 * 1000; // Har 12 ghante mein ek baar

export async function runAutoCleanup(userId?: string) {
  try {
    const lastRun = localStorage.getItem(CLEANUP_KEY);
    const now = Date.now();

    if (lastRun && now - Number(lastRun) < CLEANUP_INTERVAL_MS) {
      return; // Abhi 12 ghante nahi hue, skip karein
    }

    localStorage.setItem(CLEANUP_KEY, now.toString());

    // 1. Call database auto-cleanup RPC
    const { error: rpcError } = await (supabase.rpc as any)("cleanup_expired_buzz_data");
    if (rpcError) {
      console.warn("Database cleanup error (non-fatal):", rpcError.message);
    }

    // 2. Client-side storage bucket media cleanup (Expired Moments files)
    if (userId) {
      const { data: expiredMoments } = await supabase
        .from("moments")
        .select("image_url")
        .eq("user_id", userId)
        .lt("expires_at", new Date().toISOString());

      if (expiredMoments && expiredMoments.length > 0) {
        const filesToRemove: string[] = [];
        for (const m of expiredMoments) {
          if (m.image_url) {
            // URL se storage filename nikaalna
            const parts = m.image_url.split("/moments/");
            if (parts[1]) filesToRemove.push(decodeURIComponent(parts[1]));
          }
        }

        if (filesToRemove.length > 0) {
          await supabase.storage.from("moments").remove(filesToRemove);
        }
      }
    }
  } catch (err) {
    // Silent fail — app experience par koi effect nahi hoga
    console.warn("Storage auto-cleanup skipped:", err);
  }
}
