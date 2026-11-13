import { Send, Paperclip, Phone, Video, ArrowLeft, Check, CheckCheck, Clock, X, FileText, Info, Trash2, Pencil, Image, Smile, Reply, CornerDownRight, Forward } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ChatThread, DbMessage } from "@/hooks/useRealtimeMessages";
import TypingIndicator from "./TypingIndicator";
import EmojiPicker from "./EmojiPicker";
import MessageReactions from "./MessageReactions";
import VoiceMessageButton from "./VoiceMessageButton";
import MessageContent from "./MessageContent";
import MessageForwardDialog from "./MessageForwardDialog";
import type { DbProfile } from "@/hooks/useRealtimeMessages";
import { useChatTheme } from "./ChatThemeProvider";
import { getChatWallpaperStyle, isPhotoTheme } from "./ChatThemesPanel";
import { compressImage } from "@/lib/imageCompress";

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
  profiles: DbProfile[];
}

const ChatWindow = ({ thread, currentUserId, onSendMessage, onDeleteMessage, onEditMessage, onTyping, isOtherTyping, onBack, onStartCall, profiles }: ChatWindowProps) => {
  const { theme } = useChatTheme();
  const [input, setInput] = useState("");
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState<DbMessage | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [forwardMessage, setForwardMessage] = useState<DbMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevThreadIdRef = useRef<string>(thread.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayName = thread.profile?.display_name || thread.profile?.username || "Unknown";
  const initials = displayName.slice(0, 2).toUpperCase();

  // Instant scroll on thread change, smooth on new message
  useEffect(() => {
    const isNewThread = prevThreadIdRef.current !== thread.id;
    prevThreadIdRef.current = thread.id;

    if (isNewThread) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      }
    } else {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [thread.id, thread.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (onTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTyping(thread.id);
      typingTimeoutRef.current = setTimeout(() => {}, 2000);
    }
  };

  const handleSend = async () => {
    let textToSend = input.trim();

    if (attachedFile) {
      try {
        // Compress image to ~40KB WebP before upload (Zero storage cost)
        const fileToUpload = attachedFile.type.startsWith("image/")
          ? await compressImage(attachedFile)
          : attachedFile;

        const ext = fileToUpload.name.split(".").pop();
        const path = `${currentUserId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("chat-media").upload(path, fileToUpload);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("chat-media").getPublicUrl(path);

        const isImg = fileToUpload.type.startsWith("image/");
        const isVid = fileToUpload.type.startsWith("video/");
        const tag = isImg ? `[img]${publicUrl}[/img]` : isVid ? `[video]${publicUrl}[/video]` : `[file]${publicUrl}|${attachedFile.name}[/file]`;
        textToSend = textToSend ? `${tag}\n${textToSend}` : tag;
      } catch (err: any) {
        toast.error("Upload failed: " + err.message);
        return;
      }
      setAttachedFile(null);
      setImagePreview(null);
    }

    if (!textToSend) return;

    if (replyTo) {
      const replyPrefix = `[reply:${replyTo.id}|${(replyTo as any).profile?.display_name || (replyTo as any).profile?.username || "User"}|${replyTo.text.slice(0, 50)}]`;
      textToSend = `${replyPrefix}\n${textToSend}`;
      setReplyTo(null);
    }

    onSendMessage(thread.id, textToSend);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be under 20MB");
      return;
    }
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setReactions((prev) => {
      const current = prev[messageId] || {};
      const count = current[emoji] || 0;
      return { ...prev, [messageId]: { ...current, [emoji]: count > 0 ? 0 : 1 } };
    });
  };

  const handleSaveEdit = (messageId: string) => {
    if (editText.trim() && onEditMessage) {
      onEditMessage(messageId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  };

  const parseReply = (text: string) => {
    const match = text.match(/^\[reply:([^|]+)\|([^|]+)\|([^\]]*)\]\n?([\s\S]*)$/);
    if (match) {
      return { replyId: match[1], senderName: match[2], snippet: match[3], cleanText: match[4] };
    }
    return null;
  };

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 md:px-4 py-2.5 bg-card/60 backdrop-blur-xl z-10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button onClick={onBack} className="p-1.5 -ml-1 text-muted-foreground hover:text-foreground lg:hidden rounded-full hover:bg-muted/60 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative">
            {thread.profile?.avatar_url ? (
              <img src={thread.profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-border" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
            )}
            {thread.profile?.is_online && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate leading-tight text-foreground">{displayName}</h2>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">
              {thread.profile?.is_online ? (
                <span className="text-emerald-500 font-medium">Online</span>
              ) : (
                `@${thread.profile?.username || "user"}`
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onStartCall && (
            <>
              <button
                onClick={() => onStartCall(thread.id, "voice")}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors active:scale-95"
                title="Voice call"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={() => onStartCall(thread.id, "video")}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors active:scale-95"
                title="Video call"
              >
                <Video className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages Feed with Persistent Wallpaper */}
      <div
        ref={messagesContainerRef}
        className="chat-messages-shell flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-2 smooth-scroll-momentum chat-feed-gpu relative"
        style={getChatWallpaperStyle(theme)}
      >
        <div className="flex justify-center my-2">
          <span className="text-[11px] bg-card/80 backdrop-blur-md px-3 py-1 rounded-full border border-border text-muted-foreground/80 shadow-sm">
            🔒 End-to-end encrypted
          </span>
        </div>

        {thread.messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          const replyData = parseReply(msg.text);
          const displayText = replyData ? replyData.cleanText : msg.text;

          return (
            <div key={msg.id} className={`group flex flex-col ${isOwn ? "items-end" : "items-start"} low-fade`}>
              <div
                className={`relative max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-sm transition-shadow ${
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-br-xs"
                    : "bg-card text-foreground border border-border rounded-bl-xs"
                }`}
              >
                {/* Quoted message */}
                {replyData && (
                  <div className={`mb-1.5 rounded-lg px-2 py-1 text-xs border-l-2 ${
                    isOwn ? "bg-black/15 border-white/60 text-white/90" : "bg-muted/60 border-primary text-foreground/80"
                  }`}>
                    <p className="font-semibold text-[10px] opacity-80">{replyData.senderName}</p>
                    <p className="truncate text-[11px]">{replyData.snippet}</p>
                  </div>
                )}

                {/* Edit input or message content */}
                {editingId === msg.id ? (
                  <div className="flex flex-col gap-1.5 py-1">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="rounded bg-background text-foreground px-2 py-1 text-xs border border-border"
                      autoFocus
                    />
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setEditingId(null)} className="text-[10px] px-2 py-0.5 rounded bg-muted">Cancel</button>
                      <button onClick={() => handleSaveEdit(msg.id)} className="text-[10px] px-2 py-0.5 rounded bg-primary text-primary-foreground font-semibold">Save</button>
                    </div>
                  </div>
                ) : (
                  <MessageContent text={displayText} isOwn={isOwn} />
                )}

                {/* Meta: time + read status */}
                <div className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] ${
                  isOwn ? "text-primary-foreground/75" : "text-muted-foreground"
                }`}>
                  {msg.is_edited && <span className="italic">edited</span>}
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isOwn && (
                    msg.read_at ? (
                      <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
                    ) : (
                      <Check className="h-3.5 w-3.5 opacity-70" />
                    )
                  )}
                </div>

                {/* Quick actions hover bar */}
                <div className={`absolute top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-popover border border-border rounded-full px-1.5 py-0.5 shadow-md ${
                  isOwn ? "right-2" : "left-2"
                }`}>
                  <button onClick={() => setReplyTo(msg)} title="Reply" className="p-1 hover:text-primary text-muted-foreground">
                    <Reply className="h-3 w-3" />
                  </button>
                  <button onClick={() => setForwardMessage(msg)} title="Forward" className="p-1 hover:text-primary text-muted-foreground">
                    <Forward className="h-3 w-3" />
                  </button>
                  {isOwn && onEditMessage && (
                    <button onClick={() => { setEditingId(msg.id); setEditText(displayText); }} title="Edit" className="p-1 hover:text-primary text-muted-foreground">
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                  {isOwn && onDeleteMessage && (
                    <button onClick={() => onDeleteMessage(msg.id)} title="Delete" className="p-1 hover:text-destructive text-muted-foreground">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isOtherTyping && (
          <div className="flex items-center gap-2 low-fade">
            <div className="rounded-2xl rounded-bl-xs bg-card border border-border px-3 py-2 text-xs text-muted-foreground">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-px" />
      </div>

      {/* Reply banner preview */}
      {replyTo && (
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-1.5 text-xs">
          <div className="flex items-center gap-2 truncate">
            <CornerDownRight className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold text-primary">Replying:</span>
            <span className="truncate text-muted-foreground">{replyTo.text.slice(0, 60)}</span>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-1 hover:text-destructive">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Preview */}
      {attachedFile && (
        <div className="flex items-center justify-between border-t border-border bg-card/90 px-4 py-2">
          <div className="flex items-center gap-2.5">
            {imagePreview ? (
              <img src={imagePreview} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-border" />
            ) : (
              <FileText className="h-6 w-6 text-primary" />
            )}
            <div className="text-xs">
              <p className="font-medium truncate max-w-[200px]">{attachedFile.name}</p>
              <p className="text-muted-foreground text-[10px]">{(attachedFile.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button onClick={() => { setAttachedFile(null); setImagePreview(null); }} className="p-1 text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-border p-2 sm:p-3 bg-card/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors shrink-0"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <EmojiPicker onSelect={(emoji) => setInput((prev) => prev + emoji)} />

          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${displayName}...`}
            className="flex-1 rounded-full bg-background border border-border px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          {input.trim() || attachedFile ? (
            <button
              onClick={handleSend}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shrink-0 active:scale-95 shadow-sm"
              title="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          ) : (
            <VoiceMessageButton
              onSendVoice={async (blob) => {
                const file = new File([blob], `voice_${Date.now()}.webm`, { type: blob.type || "audio/webm" });
                const path = `${currentUserId}/${Date.now()}_voice.webm`;
                const { error } = await supabase.storage.from("chat-media").upload(path, file);
                if (error) { toast.error("Voice upload failed"); return; }
                const { data } = supabase.storage.from("chat-media").getPublicUrl(path);
                onSendMessage(thread.id, `[audio]${data.publicUrl}[/audio]`);
              }}
            />
          )}
        </div>
      </div>

      {/* Forward message dialog */}
      {forwardMessage && (
        <MessageForwardDialog
          open={!!forwardMessage}
          onOpenChange={(open) => !open && setForwardMessage(null)}
          messageText={forwardMessage.text}
          recipients={profiles.map((p) => ({
            id: p.user_id,
            name: p.display_name || p.username || "User",
            subtitle: `@${p.username || "user"}`,
            avatarUrl: p.avatar_url,
          }))}
          currentUserId={currentUserId}
          onForward={async (targets) => {
            for (const t of targets) {
              onSendMessage(t.id, forwardMessage.text);
            }
            toast.success("Forwarded message");
            setForwardMessage(null);
          }}
        />
      )}
    </div>
  );
};

export default ChatWindow;
