import { Send, Paperclip, Phone, Video, ArrowLeft, Check, CheckCheck, Clock, X, FileText, Info, Trash2, Pencil, Image, Smile, Reply, CornerDownRight, Forward, Lock } from "lucide-react";
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
import { getChatWallpaperStyle } from "./ChatThemesPanel";
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

const ChatWindow = ({
  thread,
  currentUserId,
  onSendMessage,
  onDeleteMessage,
  onEditMessage,
  onTyping,
  isOtherTyping,
  onBack,
  onStartCall,
  profiles,
}: ChatWindowProps) => {
  const { theme } = useChatTheme();
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState<DbMessage | null>(null);
  const [forwardMessage, setForwardMessage] = useState<DbMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevThreadIdRef = useRef<string>(thread.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayName = thread.profile?.display_name || thread.profile?.username || "Unknown";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (prevThreadIdRef.current !== thread.id) {
      prevThreadIdRef.current = thread.id;
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread.messages, thread.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (onTyping && thread.otherUserId) {
      if (!typingTimeoutRef.current) {
        onTyping(thread.otherUserId);
        typingTimeoutRef.current = setTimeout(() => {
          typingTimeoutRef.current = null;
        }, 2000);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      try {
        const compressed = await compressImage(file, { maxWidth: 1280, quality: 0.75 });
        setAttachedFile(compressed);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(compressed);
      } catch {
        setAttachedFile(file);
      }
    } else {
      setAttachedFile(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    let textToSend = input.trim();
    if (replyTo) {
      const replySnippet = replyTo.text.slice(0, 40).replace(/\n/g, " ");
      textToSend = `[reply:@${replyTo.sender_id === currentUserId ? "you" : displayName}:${replySnippet}]\n${textToSend}`;
    }

    if (attachedFile) {
      try {
        const ext = attachedFile.name.split(".").pop();
        const filePath = `${currentUserId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("chat-media").upload(filePath, attachedFile);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("chat-media").getPublicUrl(filePath);
        const tag = attachedFile.type.startsWith("image/") ? `[img]${data.publicUrl}[/img]` : `[file]${data.publicUrl}|${attachedFile.name}[/file]`;
        textToSend = textToSend ? `${textToSend}\n${tag}` : tag;
      } catch (err: any) {
        toast.error("File upload failed");
        return;
      }
    }

    onSendMessage(thread.otherUserId, textToSend);
    setInput("");
    setAttachedFile(null);
    setImagePreview(null);
    setReplyTo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Neo-Brutalist Chat Header */}
      <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#fffbec] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] md:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div className="relative">
            <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] gradient-brand text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a]">
              {initials}
            </div>
            {thread.profile?.is_online && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[#0a0a0a] bg-emerald-500" />
            )}
          </div>

          <div>
            <h2 className="text-sm font-black text-[#0a0a0a] leading-tight">@{displayName}</h2>
            <p className="text-[10px] font-mono font-bold text-[#5b5b55]">
              {thread.profile?.is_online ? "● ONLINE" : "OFFLINE"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onStartCall && (
            <>
              <button
                onClick={() => onStartCall(thread.otherUserId, "voice")}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                title="Voice Call"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={() => onStartCall(thread.otherUserId, "video")}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                title="Video Call"
              >
                <Video className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages Shell with Wallpaper */}
      <div
        ref={messagesContainerRef}
        className="chat-messages-shell flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-3 bz-grid-paper"
        style={getChatWallpaperStyle(theme)}
      >
        <div className="flex justify-center my-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0a0a0a] bg-white px-3 py-1 text-[11px] font-bold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]">
            <Lock className="h-3 w-3" /> End-to-end encrypted
          </span>
        </div>

        {thread.messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;

          return (
            <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
              <div
                className={`relative max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs font-semibold border-2 border-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a] ${
                  isOwn
                    ? "bg-[#FCE314] text-[#0a0a0a] rounded-br-xs"
                    : "bg-white text-[#0a0a0a] rounded-bl-xs"
                }`}
              >
                <MessageContent text={msg.text} isOwn={isOwn} />

                {/* Timestamp & Ticks */}
                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#0a0a0a]/60">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {isOwn && (
                    msg.read_at ? <CheckCheck className="h-3 w-3 text-blue-700 font-bold" /> : <Check className="h-3 w-3 opacity-70" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isOtherTyping && (
        <div className="px-4 py-1 bg-[#fffbec] border-t border-[#0a0a0a]/15 text-xs font-bold text-[#0a0a0a]">
          @{displayName} is typing...
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="border-t-2 border-[#0a0a0a] bg-[#fffbec] p-3">
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img src={imagePreview} alt="Attached preview" className="h-16 w-16 rounded-xl border-2 border-[#0a0a0a] object-cover shadow-[0_2px_0_0_#0a0a0a]" />
            <button
              onClick={() => { setImagePreview(null); setAttachedFile(null); }}
              className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white border border-[#0a0a0a]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Text Input Pill */}
          <div className="flex flex-1 items-center rounded-full border-2 border-[#0a0a0a] bg-white px-4 py-2 shadow-[0_2px_0_0_#0a0a0a] focus-within:shadow-[0_4px_0_0_#0a0a0a]">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="w-full bg-transparent text-xs font-semibold text-[#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
          </div>

          <VoiceMessageButton
            receiverId={thread.otherUserId}
            onSendVoice={(dataUrl) => onSendMessage(thread.otherUserId, `[voice]${dataUrl}[/voice]`)}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() && !attachedFile}
            className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] transition-all hover:translate-y-[-1px] disabled:opacity-50"
            title="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <MessageForwardDialog
        open={!!forwardMessage}
        onOpenChange={(o) => !o && setForwardMessage(null)}
        message={forwardMessage}
        profiles={profiles}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default ChatWindow;
