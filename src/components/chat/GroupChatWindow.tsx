import { Send, ArrowLeft, Users, UserPlus, Trash2, Settings, Phone, Video, Paperclip, X, FileText, Forward } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Group, GroupMessage, GroupMember } from "@/hooks/useGroups";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MessageContent from "./MessageContent";
import MessageForwardDialog, { type ForwardRecipient } from "./MessageForwardDialog";
import { useChatTheme } from "./ChatThemeProvider";
import { getChatWallpaperStyle, isPhotoTheme } from "./ChatThemesPanel";

interface GroupChatWindowProps {
  group: Group;
  currentUserId: string;
  onSendMessage: (groupId: string, text: string) => void;
  fetchMessages: (groupId: string) => Promise<GroupMessage[]>;
  fetchMembers: (groupId: string) => Promise<GroupMember[]>;
  onAddMember?: (groupId: string, userId: string) => void;
  onRemoveMember?: (groupId: string, userId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  onStartCall?: (userId: string, type: "voice" | "video") => void;
  onStartGroupCall?: (type: "voice" | "video") => void;
  onBack?: () => void;
  profiles: ForwardRecipient[];
  onDeleteMessage?: (messageId: string) => void;
}

const GroupChatWindow = ({
  group, currentUserId, onSendMessage, fetchMessages, fetchMembers,
  onAddMember, onRemoveMember, onDeleteGroup, onStartCall, onStartGroupCall, onBack, profiles, onDeleteMessage,
}: GroupChatWindowProps) => {
  const { theme } = useChatTheme();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<GroupMessage | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevGroupIdRef = useRef<string>(group.id);
  const longPressRef = useRef<ReturnType<typeof setTimeout>>();
  const isAdmin = group.created_by === currentUserId;

  const loadMessages = useCallback(async () => {
    const msgs = await fetchMessages(group.id);
    setMessages(msgs);
  }, [group.id, fetchMessages]);

  const loadMembers = useCallback(async () => {
    const mems = await fetchMembers(group.id);
    setMembers(mems);
  }, [group.id, fetchMembers]);

  useEffect(() => {
    loadMessages();
    loadMembers();

    const channel = supabase
      .channel(`group-${group.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "group_messages", filter: `group_id=eq.${group.id}` }, () => {
        loadMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [group.id, loadMessages, loadMembers]);

  // Instant snap on group switch, smooth glide on new incoming message
  useEffect(() => {
    const isNewGroup = prevGroupIdRef.current !== group.id;
    prevGroupIdRef.current = group.id;
    messagesEndRef.current?.scrollIntoView({ behavior: isNewGroup ? "auto" : "smooth" });
  }, [group.id, messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !attachedFile) return;
    let msgText = text;

    if (attachedFile) {
      setUploading(true);
      const currentFile = attachedFile;
      setAttachedFile(null);
      setFilePreview(null);
      const safeName = currentFile.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const path = `${currentUserId}/groups/${group.id}/${Date.now()}_${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("chat-media")
        .upload(path, currentFile, { cacheControl: "3600", upsert: false, contentType: currentFile.type || undefined });
      if (upErr) {
        toast.error("Upload failed: " + upErr.message);
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("chat-media").getPublicUrl(path);
      const url = urlData.publicUrl;
      if (currentFile.type.startsWith("image/")) msgText = `[img]${url}[/img]${text ? `\n${text}` : ""}`;
      else if (currentFile.type.startsWith("video/")) msgText = `[video]${url}[/video]${text ? `\n${text}` : ""}`;
      else msgText = `[file:${currentFile.name}]${url}[/file]${text ? `\n${text}` : ""}`;
      setUploading(false);
    }

    setInput("");
    onSendMessage(group.id, msgText);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be under 25MB");
      return;
    }
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
    e.target.value = "";
  };

  const colors = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
  const wallpaperStyle = getChatWallpaperStyle(theme);
  const photoWallpaper = isPhotoTheme(theme);

  return (
    <div
      className="chat-theme-surface flex h-full flex-col bg-background"
      data-chat-theme={theme}
      data-photo-wallpaper={photoWallpaper ? "" : undefined}
      style={wallpaperStyle}
      onClick={() => setActiveMenuId(null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-background/95 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="butter-tap rounded-full p-1.5 hover:bg-accent md:hidden">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {group.avatar_url ? (
              <img src={group.avatar_url} alt={group.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <Users className="h-5 w-5" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{group.name}</h2>
            <p className="text-xs text-muted-foreground">{members.length} members</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => onStartGroupCall?.("voice")} className="butter-tap rounded-full p-2 hover:bg-accent" title="Group voice call">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => onStartGroupCall?.("video")} className="butter-tap rounded-full p-2 hover:bg-accent" title="Group video call">
            <Video className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => setShowInfo(!showInfo)} className="butter-tap rounded-full p-2 hover:bg-accent">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {showInfo ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 smooth-scroll-momentum">
          <div className="rounded-xl bg-accent/50 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">{group.name}</h3>
            {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 px-1">Members ({members.length})</p>
            {members.map((m) => {
              const name = m.profile?.display_name || m.profile?.username || "Unknown";
              const ci = (m.profile?.username || "U").charCodeAt(0) % colors.length;
              return (
                <div key={m.id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent/50">
                  {m.profile?.avatar_url ? (
                    <img src={m.profile.avatar_url} alt={name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold ${colors[ci]}`}>
                      {name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                  {isAdmin && m.user_id !== currentUserId && onRemoveMember && (
                    <button
                      onClick={() => onRemoveMember(group.id, m.user_id)}
                      className="butter-tap rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="butter-tap w-full rounded-xl bg-accent py-2 text-xs font-medium text-foreground hover:bg-accent/80"
          >
            Back to Chat
          </button>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="chat-messages-shell flex min-h-0 flex-1 flex-col">
            <div className="chat-wallpaper min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin smooth-scroll-momentum chat-feed-gpu" data-motion-fx="off">
              <div className="relative mx-auto max-w-3xl space-y-1">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Users className="h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm">No messages yet. Say hello! 👋</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isOwn = msg.sender_id === currentUserId;
                  const senderName = msg.profile?.display_name || msg.profile?.username || "Unknown";
                  const showSender = !isOwn && (i === 0 || messages[i - 1].sender_id !== msg.sender_id);
                  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} ${showSender ? "mt-3" : "mt-0.5"}`}>
                      <div
                        className="relative group max-w-[78%] sm:max-w-[70%]"
                        onTouchStart={() => {
                          longPressRef.current = setTimeout(() => setActiveMenuId(msg.id), 500);
                        }}
                        onTouchEnd={() => clearTimeout(longPressRef.current)}
                        onContextMenu={(e) => { e.preventDefault(); setActiveMenuId(msg.id); }}
                      >
                        <div
                          className={`relative rounded-2xl px-3 py-2 shadow-sm ${
                            isOwn
                              ? "bg-chat-bubble-own text-chat-bubble-own-foreground rounded-br-md"
                              : "bg-chat-bubble-other text-chat-bubble-other-foreground rounded-bl-md"
                          }`}
                        >
                          {showSender && (
                            <p className="text-[11px] font-bold text-primary mb-0.5">{senderName}</p>
                          )}
                          <MessageContent text={msg.text} isOwn={isOwn} />
                          <div className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            <span>{time}</span>
                          </div>
                        </div>

                        {/* Menu */}
                        {activeMenuId === msg.id && (
                          <div
                            className={`absolute z-20 top-full mt-1 flex items-center gap-1 rounded-xl border border-border bg-popover/95 p-1 shadow-lg backdrop-blur-md ${
                              isOwn ? "right-0" : "left-0"
                            }`}
                          >
                            <button
                              onClick={() => { setForwardMessage(msg); setActiveMenuId(null); }}
                              className="butter-tap flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-foreground hover:bg-accent"
                            >
                              <Forward className="h-3 w-3" /> Forward
                            </button>
                            {isOwn && onDeleteMessage && (
                              <button
                                onClick={() => { onDeleteMessage(msg.id); setActiveMenuId(null); }}
                                className="butter-tap flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Attachment preview */}
          {attachedFile && (
            <div className="flex items-center gap-2 border-t border-border/60 bg-background/95 px-4 py-2">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <FileText className="h-6 w-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{attachedFile.name}</p>
                <p className="text-[10px] text-muted-foreground">{(attachedFile.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={() => { setAttachedFile(null); setFilePreview(null); }} className="butter-tap rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border/60 bg-background/95 p-3 backdrop-blur-md safe-area-bottom">
            <div className="mx-auto flex max-w-3xl items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.zip" />
              <button onClick={() => fileInputRef.current?.click()} className="butter-tap rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Message group..."
                className="flex-1 rounded-full bg-accent/60 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-accent"
              />
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !attachedFile) || uploading}
                className="butter-tap flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Forward Dialog */}
      {forwardMessage && (
        <MessageForwardDialog
          open={!!forwardMessage}
          onOpenChange={(open) => !open && setForwardMessage(null)}
          messageText={forwardMessage.text}
          profiles={profiles}
          onForward={async (recipientId, isGroup) => {
            if (isGroup) {
              onSendMessage(recipientId, `[forwarded]${forwardMessage.text}`);
            } else {
              await supabase.from("direct_messages").insert({
                sender_id: currentUserId,
                receiver_id: recipientId,
                text: `[forwarded]${forwardMessage.text}`,
              });
            }
            toast.success("Message forwarded");
            setForwardMessage(null);
          }}
        />
      )}
    </div>
  );
};

export default GroupChatWindow;
