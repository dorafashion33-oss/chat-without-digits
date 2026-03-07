import { Send, ArrowLeft, Users, UserPlus, Trash2, Settings } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Group, GroupMessage, GroupMember } from "@/hooks/useGroups";
import { supabase } from "@/integrations/supabase/client";

interface GroupChatWindowProps {
  group: Group;
  currentUserId: string;
  onSendMessage: (groupId: string, text: string) => void;
  fetchMessages: (groupId: string) => Promise<GroupMessage[]>;
  fetchMembers: (groupId: string) => Promise<GroupMember[]>;
  onAddMember?: (groupId: string, userId: string) => void;
  onRemoveMember?: (groupId: string, userId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  onBack?: () => void;
}

const GroupChatWindow = ({
  group, currentUserId, onSendMessage, fetchMessages, fetchMembers,
  onAddMember, onRemoveMember, onDeleteGroup, onBack,
}: GroupChatWindowProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages", filter: `group_id=eq.${group.id}` }, () => {
        loadMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [group.id, loadMessages, loadMembers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(group.id, input);
    setInput("");
  };

  const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500", "bg-indigo-500", "bg-fuchsia-500", "bg-cyan-500", "bg-blue-600"];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-chat-header px-4 py-3">
        {onBack && (
          <button onClick={onBack} className="rounded-full p-1 hover:bg-accent"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        )}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          <Users className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground truncate">{group.name}</h2>
          <p className="text-xs text-muted-foreground">{members.length} members</p>
        </div>
        <button onClick={() => setShowInfo(!showInfo)} className="rounded-full p-2 hover:bg-accent">
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {showInfo ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors[ci]} text-xs font-semibold text-white`}>
                      {name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground">{m.role === "admin" ? "Admin" : "Member"}</p>
                  </div>
                  {isAdmin && m.user_id !== currentUserId && onRemoveMember && (
                    <button onClick={() => { onRemoveMember(group.id, m.user_id); loadMembers(); }} className="rounded p-1 hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {isAdmin && onDeleteGroup && (
            <button onClick={() => onDeleteGroup(group.id)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors">
              <Trash2 className="h-4 w-4" /> Delete Group
            </button>
          )}
          <button onClick={() => setShowInfo(false)} className="flex w-full items-center justify-center rounded-xl bg-accent p-3 text-sm font-medium text-foreground hover:bg-accent/80">
            Back to Chat
          </button>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border) / 0.3) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}>
            <div className="mx-auto max-w-3xl space-y-1">
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
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${isOwn ? "bg-chat-bubble-own text-chat-bubble-own-foreground rounded-br-md" : "bg-chat-bubble-other text-chat-bubble-other-foreground rounded-bl-md"}`}>
                      {showSender && <p className="text-xs font-semibold text-primary mb-0.5">{senderName}</p>}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <p className="text-[10px] opacity-60 text-right mt-0.5">{time}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t bg-chat-header px-4 py-3">
            <div className="mx-auto flex max-w-3xl items-center gap-2">
              <div className="flex flex-1 items-center rounded-2xl bg-chat-input-bg px-4 py-2.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a group message..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              {input.trim() && (
                <button onClick={handleSend} className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand text-white hover:opacity-90">
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupChatWindow;
