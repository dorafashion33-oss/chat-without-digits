import { Send, Phone, Video, Paperclip, ArrowLeft, Trash2, Edit2, X, Check, CheckCheck } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import type { ChatThread, DbMessage, DbProfile } from "@/hooks/useRealtimeMessages";
import MessageContent from "./MessageContent";
import MessageForwardDialog from "./MessageForwardDialog";
import MessageReactions from "./MessageReactions";
import VoiceMessageButton from "./VoiceMessageButton";
import TypingIndicator from "./TypingIndicator";
import UserProfileDialog from "./UserProfileDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChatTheme } from "./ChatThemeProvider";
import { getChatWallpaperStyle, isPhotoTheme } from "./ChatThemesPanel";

interface ChatWindowProps {
  thread: ChatThread;
  currentUserId: string;
  onSendMessage: (receiverId: string, text: string) => void;
  profiles: DbProfile[];
  onDeleteMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newText: string) => void;
  onTyping?: (receiverId: string) => void;
  isOtherTyping?: boolean;
  onBack?: () => void;
  onStartCall?: (userId: string, type: "voice" | "video") => void;
}

const ChatWindow = ({
  thread,
  currentUserId,
  onSendMessage,
  profiles,
  onDeleteMessage,
  onEditMessage,
  onTyping,
  isOtherTyping,
  onBack,
  onStartCall,
}: ChatWindowProps) => {
  const { theme } = useChatTheme();
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [forwardMessage, setForwardMessage] = useState<DbMessage | null>(null);
  const [replyTo, setReplyTo] = useState<DbMessage | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevThreadIdRef = useRef<string>(thread.id);

  const displayName = thread.profile?.display_name || thread.profile?.username || "Unknown";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const isNew = prevThreadIdRef.current !== thread.id;
    prevThreadIdRef.current = thread.id;
    if (isNew) {
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
  }, [thread.id, thread.messages.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    onTyping?.(thread.id);
  };

  const handleSend = async () => {
    let textToSend = input.trim();

    if (attachedFile) {
      setUploading(true);
      try {
        const ext = attachedFile.name.split(".").pop();
        const path = `${currentUserId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("chat-media").upload(path, attachedFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("chat-media").getPublicUrl(path);

        const isImg = attachedFile.type.startsWith("image/");
        const isVid = attachedFile.type.startsWith("video/");
        const tag = isImg ? `[img]${publicUrl}[/img]` : isVid ? `[video]${publicUrl}[/video]` : `[file]${publicUrl}|${attachedFile.name}[/file]`;
        textToSend = textToSend ? `${tag}\n${textToSend}` : tag;
      } catch (err: any) {
        toast.error("Upload failed: " + err.message);
        setUploading(false);
        return;
      }
      setUploading(false);
      setAttachedFile(null);
      setImagePreview(null);
    }

    if (!textToSend) return;

    if (replyTo) {
      textToSend = `[reply:${replyTo.id}]${replyTo.text.slice(0, 60)}[/reply]\n${textToSend}`;
    }

    onSendMessage(thread.id, textToSend);
    setInput("");
    setReplyTo(null);
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

          <div
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="View Profile"
          >
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] gradient-brand text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a] group-hover:scale-105 transition-transform">
                {initials}
              </div>
              {thread.profile?.is_online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[#0a0a0a] bg-emerald-500" />
              )}
            </div>

            <div>
              <h2 className="text-sm font-black text-[#0a0a0a] leading-tight group-hover:underline">@{displayName}</h2>
              <p className="text-[10px] font-mono font-bold text-[#5b5b55]">
                {thread.profile?.is_online ? "● ONLINE" : "OFFLINE"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onStartCall && (
            <>
              <button
                onClick={() => onStartCall(thread.id, "voice")}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                title="Voice Call"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={() => onStartCall(thread.id, "video")}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                title="Video Call"
              >
                <Video className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div
        ref={messagesContainerRef}
        className="chat-messages-shell flex-1 overflow-y-auto px-4 py-4 space-y-3 bz-grid-paper"
        style={getChatWallpaperStyle(theme)}
      >
        <div className="flex justify-center mb-2">
          <span className="inline-block rounded-full border-2 border-[#0a0a0a] bg-[#FFF6B8] px-3 py-1 font-mono text-[10px] font-black text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]">
            🔒 END-TO-END ENCRYPTED CONVERSATION
          </span>
        </div>

        {thread.messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          const isEditing = editingMessageId === msg.id;

          return (
            <div key={msg.id} className={`group flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl border-2 border-[#0a0a0a] p-3 text-xs font-medium shadow-[0_3px_0_0_#0a0a0a] ${
                  isOwn ? "bg-[#FCE314] text-[#0a0a0a]" : "bg-white text-[#0a0a0a]"
                }`}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="rounded-lg border-2 border-[#0a0a0a] bg-white px-2 py-1 text-xs outline-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="rounded border border-[#0a0a0a] px-2 py-0.5 text-[10px] font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onEditMessage?.(msg.id, editText);
                          setEditingMessageId(null);
                        }}
                        className="rounded border border-[#0a0a0a] bg-[#0a0a0a] px-2 py-0.5 text-[10px] font-bold text-white"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <MessageContent text={msg.text} />
                    <div className="mt-1 flex items-center justify-end gap-1 font-mono text-[9px] font-bold text-[#0a0a0a]/60">
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {isOwn && (msg.is_read ? <CheckCheck className="h-3 w-3 text-blue-600" /> : <Check className="h-3 w-3" />)}
                    </div>
                  </>
                )}

                {/* Hover Actions */}
                <div
                  className={`absolute top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-1 rounded-lg border-2 border-[#0a0a0a] bg-white px-1.5 py-0.5 shadow-[0_2px_0_0_#0a0a0a] ${
                    isOwn ? "right-2" : "left-2"
                  }`}
                >
                  <MessageReactions messageId={msg.id} currentUserId={currentUserId} />
                  {isOwn && onDeleteMessage && (
                    <button onClick={() => onDeleteMessage(msg.id)} className="p-1 hover:text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  {isOwn && onEditMessage && (
                    <button
                      onClick={() => {
                        setEditingMessageId(msg.id);
                        setEditText(msg.text);
                      }}
                      className="p-1 hover:text-blue-500"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isOtherTyping && <TypingIndicator name={displayName} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachedFile && (
        <div className="flex items-center justify-between border-t-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-2">
          <div className="flex items-center gap-2">
            {imagePreview && <img src={imagePreview} alt="Preview" className="h-8 w-8 rounded border border-[#0a0a0a] object-cover" />}
            <span className="text-xs font-bold text-[#0a0a0a] truncate max-w-xs">{attachedFile.name}</span>
          </div>
          <button onClick={() => { setAttachedFile(null); setImagePreview(null); }} className="text-[#0a0a0a]">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Reply Banner */}
      {replyTo && (
        <div className="flex items-center justify-between border-t-2 border-[#0a0a0a] bg-[#DCF4E4] px-4 py-2">
          <p className="text-xs font-bold text-[#0a0a0a] truncate">Replying to: {replyTo.text.slice(0, 40)}...</p>
          <button onClick={() => setReplyTo(null)} className="text-[#0a0a0a]">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tactile Chat Input Bar */}
      <div className="border-t-2 border-[#0a0a0a] bg-[#fffbec] p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${displayName}...`}
            className="flex-1 rounded-xl border-2 border-[#0a0a0a] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
          />

          <VoiceMessageButton
            receiverId={thread.id}
            onSendVoice={(voiceUrl) => onSendMessage(thread.id, `[voice]${voiceUrl}[/voice]`)}
          />

          <button
            onClick={handleSend}
            disabled={uploading || (!input.trim() && !attachedFile)}
            className="bz-btn bz-btn-yellow grid h-10 w-10 place-items-center rounded-xl p-0 disabled:opacity-40"
            title="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Forward Modal */}
      {forwardMessage && (
        <MessageForwardDialog
          open={!!forwardMessage}
          onOpenChange={(o) => !o && setForwardMessage(null)}
          messageText={forwardMessage.text}
          profiles={profiles}
          onForward={(toId, text) => {
            onSendMessage(toId, text);
            setForwardMessage(null);
            toast.success("Forwarded successfully!");
          }}
        />
      )}

      {/* Partner User Profile Dialog */}
      {showProfile && thread.profile && (
        <UserProfileDialog
          profile={thread.profile}
          onClose={() => setShowProfile(false)}
          onMessage={() => setShowProfile(false)}
          onCall={onStartCall}
        />
      )}
    </div>
  );
};

export default ChatWindow;
