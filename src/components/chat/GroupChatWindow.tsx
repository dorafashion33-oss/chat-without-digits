import { Send, ArrowLeft, Users, UserPlus, Trash2, Settings, Phone, Video, Paperclip, X, FileText, Forward } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Group, GroupMessage, GroupMember } from "@/hooks/useGroups";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MessageContent from "./MessageContent";
import MessageForwardDialog, { type ForwardRecipient } from "./MessageForwardDialog";
import { useChatTheme } from "./ChatThemeProvider";
import { getChatWallpaperStyle } from "./ChatThemesPanel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  group,
  currentUserId,
  onSendMessage,
  fetchMessages,
  fetchMembers,
  onAddMember,
  onRemoveMember,
  onDeleteGroup,
  onStartGroupCall,
  onBack,
  profiles,
  onDeleteMessage,
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevGroupIdRef = useRef<string>(group.id);

  const loadData = useCallback(async () => {
    const [msgs, mems] = await Promise.all([fetchMessages(group.id), fetchMembers(group.id)]);
    setMessages(msgs);
    setMembers(mems);
  }, [group.id, fetchMessages, fetchMembers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const isNew = prevGroupIdRef.current !== group.id;
    prevGroupIdRef.current = group.id;
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
  }, [group.id, messages.length]);

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
    <div className="flex h-full flex-col bg-white">
      {/* Neo-Brutalist Group Header */}
      <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#fffbec] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2.5 cursor-pointer min-w-0 group"
            title="Group Info"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] flex-shrink-0 group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-[#0a0a0a] truncate leading-tight group-hover:underline">
                {group.name}
              </h2>
              <p className="text-[10px] font-mono font-bold text-[#5b5b55]">
                {members.length} members · Buzz Group
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onStartGroupCall && (
            <>
              <button
                onClick={() => onStartGroupCall("voice")}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                title="Group Voice Call"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={() => onStartGroupCall("video")}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
                title="Group Video Call"
              >
                <Video className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowInfo(true)}
            className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-[#FFF6B8]"
            title="Group Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
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
            👥 GROUP CREATED · END-TO-END ENCRYPTED
          </span>
        </div>

        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          const senderProfile = (msg as any).profiles;
          const senderName = senderProfile?.display_name || senderProfile?.username || "Member";

          return (
            <div key={msg.id} className={`group flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl border-2 border-[#0a0a0a] p-3 text-xs font-medium shadow-[0_3px_0_0_#0a0a0a] ${
                  isOwn ? "bg-[#FCE314] text-[#0a0a0a]" : "bg-white text-[#0a0a0a]"
                }`}
              >
                {!isOwn && (
                  <p className="text-[10px] font-black text-purple-700 mb-1">@{senderName}</p>
                )}
                <MessageContent text={msg.text} />
                <div className="mt-1 flex items-center justify-end gap-1 font-mono text-[9px] font-bold text-[#0a0a0a]/60">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                {/* Hover Actions */}
                <div
                  className={`absolute top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-1 rounded-lg border-2 border-[#0a0a0a] bg-white px-1.5 py-0.5 shadow-[0_2px_0_0_#0a0a0a] ${
                    isOwn ? "right-2" : "left-2"
                  }`}
                >
                  <button onClick={() => setForwardMessage(msg)} title="Forward" className="p-1 hover:text-blue-600">
                    <Forward className="h-3 w-3" />
                  </button>
                  {isOwn && onDeleteMessage && (
                    <button
                      onClick={() => {
                        onDeleteMessage(msg.id);
                        setTimeout(loadData, 300);
                      }}
                      title="Delete"
                      className="p-1 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachedFile && (
        <div className="flex items-center justify-between border-t-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-2">
          <div className="flex items-center gap-2">
            {filePreview ? (
              <img src={filePreview} alt="" className="h-8 w-8 rounded border border-[#0a0a0a] object-cover" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
            <span className="text-xs font-bold text-[#0a0a0a] truncate max-w-xs">{attachedFile.name}</span>
          </div>
          <button onClick={() => { setAttachedFile(null); setFilePreview(null); }} className="text-[#0a0a0a]">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tactile Input Bar */}
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message in ${group.name}...`}
            className="flex-1 rounded-xl border-2 border-[#0a0a0a] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
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

      {/* Group Info & Settings Modal */}
      {showInfo && (
        <Dialog open={showInfo} onOpenChange={setShowInfo}>
          <DialogContent className="max-w-md overflow-hidden p-0 rounded-3xl border-4 border-[#0a0a0a] bg-white shadow-[0_10px_0_0_#0a0a0a]">
            <div className="border-b-2 border-[#0a0a0a] bg-[#FFF6B8] p-4 flex items-center justify-between">
              <DialogTitle className="text-base font-black text-[#0a0a0a] flex items-center gap-2">
                <Users className="h-5 w-5" /> Group Info
              </DialogTitle>
              <button
                onClick={() => setShowInfo(false)}
                className="grid h-7 w-7 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 bz-grid-paper max-h-[70vh] overflow-y-auto">
              <div className="bz-card p-4 text-center">
                <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#E2ECFF] shadow-[0_2px_0_0_#0a0a0a] mb-2 font-black">
                  <Users className="h-7 w-7 text-[#0a0a0a]" />
                </div>
                <h3 className="text-base font-black text-[#0a0a0a]">{group.name}</h3>
                <p className="text-xs text-[#5b5b55] mt-1">{group.description || "Buzz Messaging Group"}</p>
              </div>

              <div>
                <p className="text-xs font-black text-[#0a0a0a] mb-2">Members ({members.length})</p>
                <div className="space-y-1.5">
                  {members.map((m) => {
                    const profile = (m as any).profiles;
                    const uName = profile?.display_name || profile?.username || "Member";
                    const isGroupAdmin = m.role === "admin" || m.user_id === group.created_by;
                    return (
                      <div key={m.id} className="bz-card p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] gradient-brand text-[10px] font-black text-white">
                            {uName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#0a0a0a]">{uName}</p>
                            <p className="text-[10px] font-mono text-[#5b5b55]">
                              {isGroupAdmin ? "★ Admin" : "Member"}
                            </p>
                          </div>
                        </div>
                        {isCreator && m.user_id !== currentUserId && onRemoveMember && (
                          <button
                            onClick={() => {
                              onRemoveMember(group.id, m.user_id);
                              setTimeout(loadData, 300);
                            }}
                            className="rounded-lg border border-red-500 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 hover:bg-red-100"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {isCreator && onDeleteGroup && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this group?")) {
                      onDeleteGroup(group.id);
                      setShowInfo(false);
                    }
                  }}
                  className="bz-btn bz-btn-ink w-full py-2.5 text-xs font-black text-red-400 hover:text-red-200 uppercase"
                >
                  <Trash2 className="h-4 w-4" /> Delete Group Permanently
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GroupChatWindow;
