import buzzLogo from "@/assets/buzz-logo.jpeg";
import { Lock, Zap } from "lucide-react";

const EmptyChat = () => (
  <div className="flex h-full flex-col items-center justify-center bg-background" style={{
    backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border) / 0.12) 1px, transparent 0)`,
    backgroundSize: "20px 20px",
  }}>
    <div className="flex flex-col items-center gap-5 text-center animate-fade-in px-6">
      <div className="relative">
        <img src={buzzLogo} alt="Buzz" className="h-24 w-24 rounded-3xl shadow-xl glow-purple object-cover" />
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full gradient-brand shadow-md">
          <Zap className="h-4 w-4 text-white" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Welcome to <span className="gradient-brand-text">Buzz</span></h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          Select a conversation to start messaging, or discover new people to connect with.
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground/60 mt-2">
        <Lock className="h-3 w-3" />
        <span className="text-[11px]">Your messages are private</span>
      </div>
    </div>
  </div>
);

export default EmptyChat;
