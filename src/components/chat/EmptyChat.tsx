import buzzLogo from "@/assets/buzz-logo.jpeg";

const EmptyChat = () => (
  <div className="flex h-full flex-col items-center justify-center bg-chat-bg-pattern" style={{
    backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border) / 0.15) 1px, transparent 0)`,
    backgroundSize: "24px 24px",
  }}>
    <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
      <img src={buzzLogo} alt="Buzz" className="h-20 w-20 rounded-2xl shadow-lg glow-purple object-cover" />
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome to <span className="gradient-brand-text">Buzz</span></h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Select a stream to start chatting, check Moments, or Connect with a call.
        </p>
      </div>
    </div>
  </div>
);

export default EmptyChat;
