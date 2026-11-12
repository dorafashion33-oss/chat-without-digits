import { Lock } from "lucide-react";
import BuzzLogoAnimation from "./BuzzLogoAnimation";

const EmptyChat = () => (
  <div
    className="flex h-full flex-col items-center justify-center bg-background"
    style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border) / 0.12) 1px, transparent 0)`,
      backgroundSize: "20px 20px",
    }}
  >
    <div className="flex flex-col items-center gap-5 text-center px-6">
      {/* 10/10 Logo Animation with Brand Aura */}
      <BuzzLogoAnimation size="xl" showAura={true} />

      <div>
        <h2 className="text-xl font-bold text-foreground">
          Welcome to <span className="gradient-brand-text">Buzz</span>
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          Select a conversation to start messaging, or discover new people to connect with.
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-muted-foreground/60 mt-1">
        <Lock className="h-3.5 w-3.5" />
        <span className="text-xs">End-to-end encrypted & private</span>
      </div>
    </div>
  </div>
);

export default EmptyChat;
