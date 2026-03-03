import { MessageCircle } from "lucide-react";

const EmptyChat = () => (
  <div className="flex h-full flex-col items-center justify-center bg-chat-bg-pattern" style={{
    backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border) / 0.15) 1px, transparent 0)`,
    backgroundSize: "24px 24px",
  }}>
    <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
        <MessageCircle className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome to Buzz</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Select a stream to start chatting, check Moments, or Connect with a call.
        </p>
      </div>
    </div>
  </div>
);

export default EmptyChat;
