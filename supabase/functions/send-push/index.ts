import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { z } from "npm:zod@3";

const Body = z.object({
  to: z.string().uuid(),
  kind: z.enum(["message", "call"]),
  text: z.string().max(200).optional(),
  callType: z.enum(["voice", "video"]).optional(),
});

webpush.setVapidDetails(
  "mailto:prasadprem904@gmail.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "unauthorized" }, 401);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: u, error: ue } = await admin.auth.getUser(token);
  if (ue || !u.user) return json({ error: "unauthorized" }, 401);

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const { to, kind, text, callType } = parsed.data;
  if (to === u.user.id) return json({ sent: 0 });

  const { data: prof } = await admin.from("profiles").select("username").eq("user_id", u.user.id).maybeSingle();
  const name = (prof as { username?: string } | null)?.username ?? "Someone";

  const payload = JSON.stringify(
    kind === "call"
      ? { title: `Incoming ${callType ?? "voice"} call`, body: `@${name} is calling you on Buzz`, tag: "buzz-call", call: true }
      : { title: `@${name}`, body: text?.startsWith("[") ? "New message" : (text ?? "New message"), tag: `buzz-msg-${u.user.id}` },
  );

  const { data: subs } = await admin.from("push_subscriptions").select("*").eq("user_id", to);
  let sent = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
        TTL: kind === "call" ? 45 : 86400,
        urgency: "high",
      });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await admin.from("push_subscriptions").delete().eq("id", s.id);
    }
  }
  return json({ sent });
});
