import { supabase } from "@/integrations/supabase/client";

const CLEANUP_KEY = "buzz:last-storage-cleanup";
const CLEANUP_INTERVAL_MS = 12 * 60 * 60 * 1000; // Har 12 ghante mein ek baar check

export async function runAutoCleanup(userId?: string) {
  try {
    const lastRun = localStorage.getItem(CLEANUP_KEY);
    const now = Date.now();

    if (lastRun && now - Number(lastRun) < CLEANUP_INTERVAL_MS) {
      return; // Skip agar abhi 12 ghante nahi hue
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
    console.warn("Storage auto-cleanup skipped:", err);
  }
}
