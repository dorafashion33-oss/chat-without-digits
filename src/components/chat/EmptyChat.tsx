import { Lock, Sparkles, MessageCircle } from "lucide-react";
import BuzzLogoAnimation from "./BuzzLogoAnimation";

const EmptyChat = () => (
  <div className="flex h-full flex-col items-center justify-center bz-grid-paper px-6">
    <div className="bz-card max-w-md p-8 text-center bg-white shadow-[0_8px_0_0_#0a0a0a]">
      {/* Animated Logo */}
      <div className="flex justify-center mb-5">
        <BuzzLogoAnimation size="xl" showAura={true} />
      </div>

      <div className="inline-block rounded-lg border-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 font-mono text-xs font-bold mb-3 shadow-[0_2px_0_0_#0a0a0a]">
        CHAT WITHOUT DIGITS 🇮🇳
      </div>

      <h2 className="text-2xl font-black text-[#0a0a0a] tracking-tight">
        Welcome to <span className="bz-squig">Buzz</span>
      </h2>

      <p className="mt-3 text-sm font-medium text-[#5b5b55] leading-relaxed">
        Select a conversation from the sidebar to chat, or tap <strong>Discover</strong> to find friends by their unique @username.
      </p>

      <div className="mt-6 pt-5 border-t-2 border-[#0a0a0a]/15 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-[#DCF4E4] px-3 py-1 text-xs font-bold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]">
          <Lock className="h-3 w-3" /> End-to-end encrypted
        </span>
      </div>
    </div>
  </div>
);

export default EmptyChat;
