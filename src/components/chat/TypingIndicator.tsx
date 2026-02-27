const TypingIndicator = () => (
  <div className="flex justify-start mt-3">
    <div className="bg-chat-bubble-other rounded-2xl rounded-bl-md px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
