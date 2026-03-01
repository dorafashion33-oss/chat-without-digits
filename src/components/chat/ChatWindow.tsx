import { Send, Paperclip, Phone, Video, MoreVertical, ArrowLeft, Check, CheckCheck, X, FileText, Info } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Chat, Message } from "@/data/mockData";
import TypingIndicator from "./TypingIndicator";
import EmojiPicker from "./EmojiPicker";
import MessageReactions from "./MessageReactions";
import VoiceMessageButton from "./VoiceMessageButton";

interface ChatWindowProps {
  chat: Chat;
  onSendMessage: (chatId: string, text: string) => void;
  onBack?: () => void;
}

const ChatWindow = ({ chat, onSendMessage, onBack }: ChatWindowProps) => {
  const [input, setInput] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, showTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text && !attachedFile) return;
    
    const msgText = attachedFile
      ? imagePreview
        ? `📷 ${attachedFile.name}${text ? `\n${text}` : ""}`
        : `📎 ${attachedFile.name} (${(attachedFile.size / 1024).toFixed(1)} KB)${text ? `\n${text}` : ""}`
      : text;
    
    onSendMessage(chat.id, msgText);
    setInput("");
    setImagePreview(null);
    setAttachedFile(null);
    
    // Simulate typing indicator
    setShowTyping(true);
    setTimeout(() => setShowTyping(false), 1500);
  };

  const handleEmojiSelect = useCallback((emoji: string) => {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();
  }, []);

  const handleReact = useCallback((messageId: string, emoji: string) => {
    setReactions((prev) => {
      const msgReactions = { ...(prev[messageId] || {}) };
      msgReactions[emoji] = (msgReactions[emoji] || 0) + 1;
      return { ...prev, [messageId]: msgReactions };
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
    e.target.value = "";
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
            <Info className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-accent">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-chat-bg-pattern p-4 scrollbar-thin" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border) / 0.3) 1px, transparent 0)`,
        backgroundSize: "24px 24px",
      }}>
        <div className="mx-auto max-w-3xl space-y-1">
          {chat.messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              showTail={i === 0 || chat.messages[i - 1].senderId !== msg.senderId}
              reactions={reactions[msg.id] || {}}
              onReact={(emoji) => handleReact(msg.id, emoji)}
            />
          ))}
          {showTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Attachment preview */}
      {attachedFile && (
        <div className="border-t bg-chat-header px-4 py-2">
          <div className="mx-auto max-w-3xl flex items-center gap-3">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{attachedFile.name}</p>
              <p className="text-xs text-muted-foreground">{(attachedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => { setAttachedFile(null); setImagePreview(null); }} className="rounded-full p-1 hover:bg-accent">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t bg-chat-header px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <EmojiPicker onSelect={handleEmojiSelect} />
          <button onClick={() => fileInputRef.current?.click()} className="rounded-full p-2 transition-colors hover:bg-accent">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt,.zip" />
          <div className="flex flex-1 items-center rounded-2xl bg-chat-input-bg px-4 py-2.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {input.trim() || attachedFile ? (
            <button
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>
          ) : (
            <VoiceMessageButton />
          )}
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({
  message,
  showTail,
  reactions,
  onReact,
}: {
  message: Message;
  showTail: boolean;
  reactions: Record<string, number>;
  onReact: (emoji: string) => void;
}) => {
  const isOwn = message.senderId === "me";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} ${showTail ? "mt-3" : "mt-0.5"} animate-fade-in`}>
      <div className="relative group">
        <div
          className={`relative max-w-[75%] rounded-2xl px-3.5 py-2 ${
            isOwn
              ? `bg-chat-bubble-own text-chat-bubble-own-foreground ${showTail ? "rounded-br-md" : ""}`
              : `bg-chat-bubble-other text-chat-bubble-other-foreground ${showTail ? "rounded-bl-md" : ""}`
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          <div className="mt-0.5 flex items-center justify-end gap-1">
            <span className="text-[10px] opacity-60">{message.timestamp}</span>
            {isOwn && (
              message.status === "read" ? (
                <CheckCheck className="h-3.5 w-3.5 text-primary transition-all" />
              ) : (
                <Check className="h-3.5 w-3.5 opacity-50 transition-all" />
              )
            )}
          </div>
        </div>
        <MessageReactions reactions={reactions} onReact={onReact} isOwn={isOwn} />
      </div>
    </div>
  );
};

export default ChatWindow;
