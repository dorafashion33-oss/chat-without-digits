import { MessageCircle } from "lucide-react";

const EmptyChat = () => (
  <div className="flex h-full flex-col items-center justify-center bg-chat-bg-pattern">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
        <MessageCircle className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome to Buzz</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Select a stream to start chatting, check Moments, explore Circles, or Connect with a call.
        </p>
      </div>
    </div>
  </div>
);

export default EmptyChat;
