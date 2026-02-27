import { Send, Smile, Paperclip, Phone, Video, MoreVertical, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Chat, Message } from "@/data/mockData";

interface ChatWindowProps {
  chat: Chat;
  onSendMessage: (chatId: string, text: string) => void;
  onBack?: () => void;
}

const ChatWindow = ({ chat, onSendMessage, onBack }: ChatWindowProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(chat.id, input.trim());
    setInput("");
  };

  const colors = [
    "bg-primary", "bg-emerald-500", "bg-sky-500", "bg-amber-500",
    "bg-rose-500", "bg-violet-500", "bg-cyan-500", "bg-orange-500",
  ];
  const colorIndex = chat.user.id.charCodeAt(0) % colors.length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-chat-header px-4 py-3">
        {onBack && (
          <button onClick={onBack} className="mr-1 rounded-full p-1 hover:bg-accent lg:hidden">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        <div className="relative">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors[colorIndex]} text-sm font-semibold text-white`}>
            {chat.user.avatar}
          </div>
          {chat.user.isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-chat-header bg-online" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">{chat.user.displayName}</h2>
          <p className="text-xs text-muted-foreground">
            {chat.user.isOnline ? "Online" : `Last seen ${chat.user.lastSeen}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-full p-2 transition-colors hover:bg-accent">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-accent">
            <Video className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-accent">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-chat-bg-pattern p-4 scrollbar-thin">
        <div className="mx-auto max-w-3xl space-y-1">
          {chat.messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} showTail={i === 0 || chat.messages[i - 1].senderId !== msg.senderId} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-chat-header px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button className="rounded-full p-2 transition-colors hover:bg-accent">
            <Smile className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-accent">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex flex-1 items-center rounded-2xl bg-chat-input-bg px-4 py-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, showTail }: { message: Message; showTail: boolean }) => {
  const isOwn = message.senderId === "me";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} ${showTail ? "mt-3" : "mt-0.5"}`}>
      <div
        className={`relative max-w-[75%] rounded-2xl px-3.5 py-2 ${
          isOwn
            ? `bg-chat-bubble-own text-chat-bubble-own-foreground ${showTail ? "rounded-br-md" : ""}`
            : `bg-chat-bubble-other text-chat-bubble-other-foreground ${showTail ? "rounded-bl-md" : ""}`
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <div className={`mt-0.5 flex items-center justify-end gap-1 ${isOwn ? "" : ""}`}>
          <span className="text-[10px] opacity-60">{message.timestamp}</span>
          {isOwn && (
            message.status === "read" ? (
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Check className="h-3.5 w-3.5 opacity-50" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
