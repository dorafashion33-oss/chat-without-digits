import { compressImage } from "@/lib/imageCompress";
import { useState, useRef, useEffect, useMemo } from "react";
import { Phone, Video, Send, ArrowLeft, Smile, Trash2, Reply, X, Paperclip, Check, CheckCheck, MoreVertical, Eraser, VolumeX, Volume2, ShieldAlert } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type ChatThread, type DbMessage, type DbProfile } from "@/hooks/useRealtimeMessages";
import MessageReactions from "./MessageReactions";
import EmojiPicker from "./EmojiPicker";
import MessageForwardDialog from "./MessageForwardDialog";
import UserProfileDialog from "./UserProfileDialog";
import VoiceMessageButton from "./VoiceMessageButton";
import MessageContent from "./MessageContent";
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
  onClearChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
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
  onClearChat,
  onDeleteChat,
}: ChatWindowProps) => {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [editingMessage, setEditingMessage] = useState<DbMessage | null>(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState<DbMessage | null>(null);
  const [forwardMessage, setForwardMessage] = useState<DbMessage | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activePartnerProfile, setActivePartnerProfile] = useState<DbProfile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { theme } = useChatTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevThreadIdRef = useRef<string>(thread.id);

  const displayName = thread.profile?.display_name || thread.profile?.username || "Unknown";
  const initials = displayName.slice(0, 2).toUpperCase();

  // Load fresh partner profile for reliable profile view
  useEffect(() => {
    const partner = thread.profile || profiles.find((p) => p.user_id === thread.id);
    if (partner) {
      setActivePartnerProfile(partner);
    } else {
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", thread.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setActivePartnerProfile(data);
        });
    }
  }, [thread.id, thread.profile, profiles]);

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
    const typingAllowed = localStorage.getItem("buzz-privacy-typing") !== "0";
    if (typingAllowed) onTyping?.(thread.id);
  };

  const handleSend = async () => {
    let textToSend = input.trim();

    if (attachedFile) {
      setUploading(true);
      try {
                // 10MB photo ko 50KB WebP mein compress karna
        const fileToUpload = attachedFile.type.startsWith("image/")
          ? await compressImage(attachedFile)
          : attachedFile;
        const ext = fileToUpload.name.split(".").pop() || "webp";
        const path = `${currentUserId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("chat-media").upload(path, fileToUpload);
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

  const handleOpenProfile = () => {
    setShowProfile(true);
  };

  // Filter profiles for forward: only contacts with whom user has active thread
  const chattedProfiles = useMemo(() => {
    return profiles.filter(
      (p) => p.user_id !== currentUserId && (p.user_id === thread.id || thread.messages.length > 0)
    );
  }, [profiles, currentUserId, thread.id, thread.messages.length]);

   return (
    <div className="flex h-full flex-col bg-white">
      {/* 🇮🇳 Tiranga Chat Header Ribbon */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] flex-shrink-0 animate-pulse" />
      {/* Header */}
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

          <button
            type="button"
            onClick={handleOpenProfile}
            className="flex items-center gap-2.5 text-left group cursor-pointer p-1 rounded-xl hover:bg-[#FFF6B8]/50 transition-colors"
            title="Click to view full profile"
          >
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-xl border-2 border-[#0a0a0a] overflow-hidden bg-white shadow-[0_2px_0_0_#0a0a0a] group-hover:scale-105 transition-transform">
                {thread.profile?.avatar_url ? (
                  <img
                    src={thread.profile.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
                <div
                  className={`h-full w-full gradient-brand flex items-center justify-center text-xs font-black text-white ${
                    thread.profile?.avatar_url ? "hidden" : "flex"
                  }`}
                >
                  {initials}
                </div>
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
          </button>
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

          {/* WhatsApp Header 3-Dots Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                title="More Options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl border-2 border-[#0a0a0a] bg-white p-1.5 shadow-[0_4px_0_0_#0a0a0a]">
              <DropdownMenuItem
                onClick={handleOpenProfile}
                className="cursor-pointer gap-2 rounded-lg text-xs font-bold text-[#0a0a0a] hover:bg-[#FFF6B8]"
              >
                View Profile (@{displayName})
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#0a0a0a]/10 my-1" />

              <DropdownMenuItem
                onClick={() => {
                  if (confirm(`Clear all messages with @${displayName}?`)) {
                    onClearChat?.(thread.id);
                    toast.success("Chat cleared");
                  }
                }}
                className="cursor-pointer gap-2 rounded-lg text-xs font-bold text-amber-600 hover:bg-amber-50"
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear Chat (खाली करें)
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  if (confirm(`Delete conversation with @${displayName}?`)) {
                    onDeleteChat?.(thread.id);
                    onBack?.();
                    toast.success("Chat deleted");
                  }
                }}
                className="cursor-pointer gap-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Chat (हटाएं)
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#0a0a0a]/10 my-1" />

              <DropdownMenuItem
                onClick={() => {
                  toast.success(`@${displayName} blocked`);
                }}
                className="cursor-pointer gap-2 rounded-lg text-xs font-bold text-[#5b5b55] hover:bg-red-50 hover:text-red-600"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Block Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Shell */}
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
          return (
            <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"} group/msg`}>
              <div
                className={`max-w-[80%] rounded-2xl border-2 border-[#0a0a0a] px-3.5 py-2.5 text-xs font-medium shadow-[0_3px_0_0_#0a0a0a] ${
                  isOwn
                    ? "bg-[#FFF6B8] text-[#0a0a0a]"
                    : isPhotoTheme(theme)
                    ? "bg-white/95 backdrop-blur-md text-[#0a0a0a]"
                    : "bg-white text-[#0a0a0a]"
                }`}
              >
                <MessageContent text={msg.text} isOwn={isOwn} />

                <div className="mt-1 flex items-center justify-end gap-1.5 text-[9px] font-mono font-bold text-[#5b5b55]">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {isOwn && (
                    <span>
                      {msg.read_at ? (
                        <CheckCheck className="inline h-3 w-3 stroke-[3] text-blue-600" />
                      ) : (
                        <Check className="inline h-3 w-3 stroke-[3]" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="opacity-0 group-hover/msg:opacity-100 flex items-center gap-1 mt-1 transition-opacity">
                <button
                  onClick={() => setReplyTo(msg)}
                  className="rounded border border-[#0a0a0a] bg-white p-1 shadow-[0_1px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                  title="Reply"
                >
                  <Reply className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setForwardMessage(msg)}
                  className="rounded border border-[#0a0a0a] bg-white p-1 shadow-[0_1px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                  title="Forward"
                >
                  <Paperclip className="h-3 w-3" />
                </button>
                {isOwn && onDeleteMessage && (
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="rounded border border-[#0a0a0a] bg-white p-1 text-red-600 shadow-[0_1px_0_0_#0a0a0a] hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isOtherTyping && (
          <div className="flex items-center gap-2 text-xs font-bold text-[#5b5b55] italic bg-white/80 border border-[#0a0a0a] px-3 py-1 rounded-full w-fit">
            <span>typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Voice Modes */}
      <div className="border-t-2 border-[#0a0a0a] bg-[#fffbec] p-3">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between rounded-xl border-2 border-[#0a0a0a] bg-white px-3 py-1.5 text-xs font-semibold">
            <span className="truncate">Replying to: {replyTo.text.slice(0, 40)}</span>
            <button onClick={() => setReplyTo(null)} className="font-bold">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {imagePreview && (
          <div className="relative mb-2 inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-xl border-2 border-[#0a0a0a] object-cover" />
            <button
              onClick={() => {
                setAttachedFile(null);
                setImagePreview(null);
              }}
              className="absolute -right-2 -top-2 rounded-full border border-[#0a0a0a] bg-red-500 p-1 text-white shadow"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-white shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your encrypted message..."
              className="w-full rounded-xl border-2 border-[#0a0a0a] bg-white px-3.5 py-2 text-xs font-bold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] outline-none placeholder:text-[#5b5b55]"
            />
          </div>

          {/* Voice Button supporting all 5 Ghost Modes */}
          <VoiceMessageButton
            receiverId={thread.id}
            onSendVoice={(voiceUrl, effect) => {
              if (effect && effect !== "normal") {
                onSendMessage(thread.id, `[voice:${effect}]${voiceUrl}`);
              } else {
                onSendMessage(thread.id, `[voice]${voiceUrl}[/voice]`);
              }
            }}
          />

          <button
            onClick={handleSend}
            disabled={uploading || (!input.trim() && !attachedFile)}
            className="bz-btn bz-btn-yellow relative overflow-hidden group h-10 px-4 text-xs font-black uppercase disabled:opacity-40"
          >
            {/* 🇮🇳 Tiranga Beam Sweep */}
            <span className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[tiranga-beam_3.5s_infinite_ease-in-out]" />
            <Send className="h-4 w-4 relative z-10" />
          </button>
        </div>
      </div>

      {/* Forward Modal - Shows only Chatted Contacts */}
      {forwardMessage && (
        <MessageForwardDialog
          open={!!forwardMessage}
          onOpenChange={(o) => !o && setForwardMessage(null)}
          messageText={forwardMessage.text}
          profiles={chattedProfiles}
          onForward={(toId, text) => {
            onSendMessage(toId, text);
            setForwardMessage(null);
            toast.success("Forwarded successfully!");
          }}
        />
      )}

      {/* Partner User Profile Dialog */}
      {showProfile && (
        <UserProfileDialog
          profile={
            activePartnerProfile ||
            thread.profile || {
              id: thread.id,
              user_id: thread.id,
              username: displayName.replace(/^@/, ""),
              display_name: displayName,
              about: "Hey there! I'm using Buzz 💬",
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_online: false,
              last_seen: null,
            }
          }
          onClose={() => setShowProfile(false)}
          onMessage={() => setShowProfile(false)}
          onCall={onStartCall}
        />
      )}
    </div>
  );
};

export default ChatWindow;
