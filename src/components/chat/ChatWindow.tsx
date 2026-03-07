import { Send, Paperclip, Phone, Video, MoreVertical, ArrowLeft, Check, CheckCheck, X, FileText, Info, Trash2, Pencil } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatThread } from "@/hooks/useRealtimeMessages";
import type { Tables } from "@/integrations/supabase/types";
import TypingIndicator from "./TypingIndicator";
import EmojiPicker from "./EmojiPicker";
import MessageReactions from "./MessageReactions";
import VoiceMessageButton from "./VoiceMessageButton";

type DbMessage = Tables<"messages">;

interface ChatWindowProps {
  thread: ChatThread;
  currentUserId: string;
  onSendMessage: (receiverId: string, text: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newText: string) => void;
  onTyping?: (receiverId: string) => void;
  isOtherTyping?: boolean;
  onBack?: () => void;
  onStartCall?: (userId: string, type: "voice" | "video") => void;
}

const ChatWindow = ({ thread, currentUserId, onSendMessage, onDeleteMessage, onEditMessage, onTyping, isOtherTyping, onBack, onStartCall }: ChatWindowProps) => {
  const [input, setInput] = useState("");
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages, isOtherTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text && !attachedFile) return;
    const msgText = attachedFile
      ? imagePreview
        ? `📷 ${attachedFile.name}${text ? `\n${text}` : ""}`
        : `📎 ${attachedFile.name} (${(attachedFile.size / 1024).toFixed(1)} KB)${text ? `\n${text}` : ""}`
      : text;
    onSendMessage(thread.id, msgText);
    setInput("");
    setImagePreview(null);
    setAttachedFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (onTyping) {
      clearTimeout(typingTimeoutRef.current);
      onTyping(thread.id);
      typingTimeoutRef.current = setTimeout(() => {}, 2000);
    }
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

  const handleStartEdit = (msg: DbMessage) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim() && onEditMessage) {
      onEditMessage(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  };

  const displayName = thread.profile.display_name || thread.profile.username;
  const initials = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500",
    "bg-indigo-500", "bg-fuchsia-500", "bg-cyan-500", "bg-blue-600",
  ];
  const colorIndex = thread.profile.username.charCodeAt(0) % colors.length;

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
          {thread.profile.avatar_url ? (
            <img src={thread.profile.avatar_url} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors[colorIndex]} text-sm font-semibold text-white`}>
              {initials}
            </div>
          )}
          {thread.profile.is_online && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-chat-header bg-online" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">{displayName}</h2>
          <p className="text-xs text-muted-foreground">
            {isOtherTyping ? (
              <span className="text-primary font-medium">typing...</span>
            ) : thread.profile.is_online ? "Online" : thread.profile.last_seen ? `Last seen ${formatLastSeen(thread.profile.last_seen)}` : "Offline"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onStartCall?.(thread.id, "voice")} className="rounded-full p-2 transition-colors hover:bg-accent"><Phone className="h-4 w-4 text-muted-foreground" /></button>
          <button onClick={() => onStartCall?.(thread.id, "video")} className="rounded-full p-2 transition-colors hover:bg-accent"><Video className="h-4 w-4 text-muted-foreground" /></button>
          <button className="rounded-full p-2 transition-colors hover:bg-accent"><Info className="h-4 w-4 text-muted-foreground" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-chat-bg-pattern p-4 scrollbar-thin" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border) / 0.3) 1px, transparent 0)`,
        backgroundSize: "24px 24px",
      }}>
        <div className="mx-auto max-w-3xl space-y-1">
          {thread.messages.map((msg, i) => {
            const isOwn = msg.sender_id === currentUserId;
            const isEditing = editingId === msg.id;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={isOwn}
                showTail={i === 0 || thread.messages[i - 1].sender_id !== msg.sender_id}
                reactions={reactions[msg.id] || {}}
                onReact={(emoji) => handleReact(msg.id, emoji)}
                onDelete={isOwn && onDeleteMessage ? () => onDeleteMessage(msg.id) : undefined}
                onEdit={isOwn && onEditMessage ? () => handleStartEdit(msg) : undefined}
                isEditing={isEditing}
                editText={editText}
                onEditTextChange={setEditText}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => { setEditingId(null); setEditText(""); }}
              />
            );
          })}
          {isOtherTyping && <TypingIndicator />}
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
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {input.trim() || attachedFile ? (
            <button
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand text-white transition-all hover:opacity-90 glow-purple"
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
  isOwn,
  showTail,
  reactions,
  onReact,
  onDelete,
  onEdit,
  isEditing,
  editText,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
}: {
  message: DbMessage;
  isOwn: boolean;
  showTail: boolean;
  reactions: Record<string, number>;
  onReact: (emoji: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isEditing?: boolean;
  editText?: string;
  onEditTextChange?: (text: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}) => {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} ${showTail ? "mt-3" : "mt-0.5"} animate-fade-in`}>
      <div className="relative group max-w-[75%]">
        <div
          className={`relative rounded-2xl px-3.5 py-2 ${
            isOwn
              ? `bg-chat-bubble-own text-chat-bubble-own-foreground ${showTail ? "rounded-br-md" : ""}`
              : `bg-chat-bubble-other text-chat-bubble-other-foreground ${showTail ? "rounded-bl-md" : ""}`
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => onEditTextChange?.(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit?.(); if (e.key === "Escape") onCancelEdit?.(); }}
                className="w-full bg-transparent text-sm outline-none border-b border-primary pb-1"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button onClick={onCancelEdit} className="text-[10px] text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={onSaveEdit} className="text-[10px] text-primary font-medium hover:text-primary/80">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          )}
          <div className="mt-0.5 flex items-center justify-end gap-1">
            <span className="text-[10px] opacity-60">{time}</span>
            {isOwn && (
              message.read_at ? (
                <CheckCheck className="h-3.5 w-3.5 text-primary transition-all" />
              ) : (
                <Check className="h-3.5 w-3.5 opacity-50 transition-all" />
              )
            )}
          </div>
        </div>

        {/* Edit/Delete actions for own messages */}
        {isOwn && !isEditing && (
          <div className={`absolute -top-8 right-0 z-10 hidden group-hover:flex items-center gap-0.5 rounded-lg border bg-popover px-1 py-0.5 shadow-md animate-scale-in`}>
            {onEdit && (
              <button onClick={onEdit} className="rounded p-1 hover:bg-accent transition-colors" title="Edit">
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="rounded p-1 hover:bg-destructive/10 transition-colors" title="Delete">
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            )}
          </div>
        )}

        <MessageReactions reactions={reactions} onReact={onReact} isOwn={isOwn} />
      </div>
    </div>
  );
};

function formatLastSeen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default ChatWindow;
