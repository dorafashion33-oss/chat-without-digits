import { useState } from "react";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface MessageReactionsProps {
  reactions: Record<string, number>;
  onReact: (emoji: string) => void;
  isOwn: boolean;
}

const MessageReactions = ({ reactions, onReact, isOwn }: MessageReactionsProps) => {
  const [showBar, setShowBar] = useState(false);

  return (
    <div className="relative">
      {/* Reaction bar on hover */}
      {showBar && (
        <div
          className={`absolute -top-10 z-10 flex gap-0.5 rounded-full border bg-popover px-1.5 py-1 shadow-lg animate-scale-in ${
            isOwn ? "right-0" : "left-0"
          }`}
        >
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => { onReact(emoji); setShowBar(false); }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm hover:bg-accent transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Trigger area */}
      <div
        onMouseEnter={() => setShowBar(true)}
        onMouseLeave={() => setShowBar(false)}
        className="absolute inset-0 cursor-pointer"
      />

      {/* Displayed reactions */}
      {Object.keys(reactions).length > 0 && (
        <div className={`flex gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
          {Object.entries(reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className="flex items-center gap-0.5 rounded-full border bg-popover px-1.5 py-0.5 text-xs shadow-sm hover:bg-accent transition-colors"
            >
              <span>{emoji}</span>
              {count > 1 && <span className="text-muted-foreground">{count}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
