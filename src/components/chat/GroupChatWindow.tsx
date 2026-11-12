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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevGroupIdRef = useRef<string>(group.id);

  // Load group messages & members
  const loadData = useCallback(async () => {
    const [msgs, mems] = await Promise.all([fetchMessages(group.id), fetchMembers(group.id)]);
    setMessages(msgs);
    setMembers(mems);
  }, [group.id, fetchMessages, fetchMembers]);

  useEffect(() => { loadData(); }, [loadData]);

  // Instant scroll on group change, smooth on new message
  useEffect(() => {
    const isNewGroup = prevGroupIdRef.current !== group.id;
    prevGroupIdRef.current = group.id;

    if (isNewGroup) {
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
  }, [group.id, messages]);

  const handleSend = async () => {
    let textToSend = input.trim();

    if (attachedFile) {
      setUploading(true);
      try {
        const ext = attachedFile.name.split(".").pop();
        const path = `groups/${group.id}/${Date.now()}.${ext}`;
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
      setFilePreview(null);
    }

    if (!textToSend) return;

    onSendMessage(group.id, textToSend);
    setInput("");
    setTimeout(loadData, 300);
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
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const isCreator = group.created_by === currentUserId;

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 md:px-4 py-2.5 bg-card/60 backdrop-blur-xl z-10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button onClick={onBack} className="p-1.5 -ml-1 text-muted-foreground hover:text-foreground lg:hidden rounded-full hover:bg-muted/60 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white shadow-sm shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0 cursor-pointer" onClick={() => setShowInfo(!showInfo)}>
            <h2 className="text-sm font-semibold truncate leading-tight text-foreground">{group.name}</h2>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">{members.length} members</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onStartGroupCall && (
            <>
              <button onClick={() => onStartGroupCall("voice")} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors active:scale-95" title="Group voice call">
                <Phone className="h-4 w-4" />
              </button>
              <button onClick={() => onStartGroupCall("video")} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors active:scale-95" title="Group video call">
                <Video className="h-4 w-4" />
              </button>
            </>
          )}
          <button onClick={() => setShowInfo(!showInfo)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed with Wallpaper */}
      <div
        ref={messagesContainerRef}
        className="chat-messages-shell flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-2 smooth-scroll-momentum chat-feed-gpu relative"
        style={getChatWallpaperStyle(theme)}
      >
        <div className="flex justify-center my-2">
          <span className="text-[11px] bg-card/80 backdrop-blur-md px-3 py-1 rounded-full border border-border text-muted-foreground/80 shadow-sm">
            👥 Group Created · End-to-end encrypted
          </span>
        </div>

        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          const senderProfile = (msg as any).profiles;
          const senderName = senderProfile?.display_name || senderProfile?.username || "Member";

          return (
            <div key={msg.id} className={`group flex flex-col ${isOwn ? "items-end" : "items-start"} low-fade`}>
              <div
                className={`relative max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-sm transition-shadow ${
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-br-xs"
                    : "bg-card text-foreground border border-border rounded-bl-xs"
                }`}
              >
                {!isOwn && (
                  <p className="text-[11px] font-semibold text-primary mb-0.5 leading-tight">{senderName}</p>
                )}
                <MessageContent text={msg.text} isOwn={isOwn} />

                <div className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] ${
                  isOwn ? "text-primary-foreground/75" : "text-muted-foreground"
                }`}>
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                {/* Quick actions hover */}
                <div className={`absolute top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-popover border border-border rounded-full px-1.5 py-0.5 shadow-md ${
                  isOwn ? "right-2" : "left-2"
                }`}>
                  <button onClick={() => setForwardMessage(msg)} title="Forward" className="p-1 hover:text-primary text-muted-foreground">
                    <Forward className="h-3 w-3" />
                  </button>
                  {isOwn && onDeleteMessage && (
                    <button onClick={() => { onDeleteMessage(msg.id); setTimeout(loadData, 300); }} title="Delete" className="p-1 hover:text-destructive text-muted-foreground">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} className="h-px" />
      </div>

      {/* Attachment Preview */}
      {attachedFile && (
        <div className="flex items-center justify-between border-t border-border bg-card/90 px-4 py-2">
          <div className="flex items-center gap-2.5">
            {filePreview ? (
              <img src={filePreview} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-border" />
            ) : (
              <FileText className="h-6 w-6 text-primary" />
            )}
            <div className="text-xs">
              <p className="font-medium truncate max-w-[200px]">{attachedFile.name}</p>
              <p className="text-muted-foreground text-[10px]">{(attachedFile.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button onClick={() => { setAttachedFile(null); setFilePreview(null); }} className="p-1 text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-border p-2 sm:p-3 bg-card/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors shrink-0"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${group.name}...`}
            className="flex-1 rounded-full bg-background border border-border px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <button
            onClick={handleSend}
            disabled={uploading || (!input.trim() && !attachedFile)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all shrink-0 active:scale-95 shadow-sm"
            title="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Forward message dialog */}
      {forwardMessage && (
        <MessageForwardDialog
          open={!!forwardMessage}
          onOpenChange={(open) => !open && setForwardMessage(null)}
          messageText={forwardMessage.text}
          recipients={profiles}
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

export default GroupChatWindow;
