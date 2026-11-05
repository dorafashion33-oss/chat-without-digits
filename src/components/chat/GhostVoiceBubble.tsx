import { GHOST_EFFECTS, parseVoice } from "@/lib/ghostVoice";

export function MessageText({ text }: { text: string }) {
  const v = parseVoice(text);
  if (!v) return <>{text}</>;
  const label = GHOST_EFFECTS.find((e) => e.id === v.effect)?.label ?? "Voice";
  return (
    <span className="block space-y-1">
      <span className="block text-xs font-semibold opacity-80">{label} · secret voice — guess who?</span>
      <audio controls src={v.src} className="h-9 max-w-[240px]" />
    </span>
  );
}
