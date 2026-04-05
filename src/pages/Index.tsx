import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import NavIconBar, { type NavSection } from "@/components/chat/NavIconBar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyChat from "@/components/chat/EmptyChat";
import SectionPanel from "@/components/chat/SectionPanel";
import MobileBottomNav from "@/components/chat/MobileBottomNav";
import GroupSidebar from "@/components/chat/GroupSidebar";
import GroupChatWindow from "@/components/chat/GroupChatWindow";
import CallScreen from "@/components/chat/CallScreen";
import InstallPrompt from "@/components/chat/InstallPrompt";
import AuthPage from "@/pages/AuthPage";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useMoments } from "@/hooks/useMoments";
import { useGroups } from "@/hooks/useGroups";
import { useWebRTC } from "@/hooks/useWebRTC";
import type { Session } from "@supabase/supabase-js";
import buzzLogo from "@/assets/buzz-logo.jpeg";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>("streams");
  const [showGroups, setShowGroups] = useState(false);
  const [username, setUsername] = useState<string>("");

  const currentUserId = session?.user?.id;
  const { threads, profiles, sendMessage, deleteMessage, editMessage, markAsRead, sendTyping, typingUsers } = useRealtimeMessages(currentUserId);
  const { moments, postMoment, deleteMoment } = useMoments(currentUserId);
  const { groups, createGroup, fetchGroupMessages, sendGroupMessage, fetchGroupMembers, addMember, removeMember, deleteGroup, refetch: refetchGroups } = useGroups(currentUserId);
  const { callState, callType, remoteProfile, callDuration, localVideoRef, remoteVideoRef, isRemoteOnline, startCall, endCall, acceptCall, rejectCall, toggleMute, toggleVideo } = useWebRTC(currentUserId);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUsername(meta?.username || meta?.display_name || "User");
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUsername(meta?.username || meta?.display_name || "User");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (activeChatId) markAsRead(activeChatId);
  }, [activeChatId, markAsRead]);

  const isStreamsSection = activeSection === "streams";

  // Build virtual thread for new chats
  const activeThread = (() => {
    const existing = threads.find((t) => t.id === activeChatId);
    if (existing) return existing;
    if (!activeChatId || !isStreamsSection || showGroups) return null;
    const profile = profiles.find((p) => p.user_id === activeChatId);
    if (!profile) return null;
    return { id: activeChatId, profile, messages: [], lastMessage: "", lastMessageTime: "", unreadCount: 0 } as import("@/hooks/useRealtimeMessages").ChatThread;
  })();

  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;
  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);
  const isOtherTyping = activeChatId ? typingUsers.has(activeChatId) : false;

  const handleSendMessage = useCallback((receiverId: string, text: string) => { sendMessage(receiverId, text); }, [sendMessage]);

  const handleNavigate = useCallback((section: NavSection) => {
    setActiveSection(section);
    if (section !== "streams") { setActiveChatId(null); setShowGroups(false); setActiveGroupId(null); }
  }, []);

  const handleStartChat = useCallback((userId: string) => {
    setActiveChatId(userId);
    setActiveSection("streams");
    setShowGroups(false);
    setActiveGroupId(null);
  }, []);

  const handleToggleGroups = useCallback(() => {
    setShowGroups((prev) => !prev);
    setActiveChatId(null);
    setActiveGroupId(null);
    setActiveSection("streams");
  }, []);

  const handleSelectGroup = useCallback((groupId: string) => {
    setActiveGroupId(groupId);
    setActiveChatId(null);
  }, []);

  const handleStartCall = useCallback((userId: string, type: "voice" | "video") => {
    startCall(userId, type);
  }, [startCall]);

  const handleCreateGroup = useCallback(async (name: string, description: string, memberIds: string[]) => {
    await createGroup(name, description, memberIds);
    refetchGroups();
  }, [createGroup, refetchGroups]);

  const handleDeleteGroup = useCallback(async (groupId: string) => {
    await deleteGroup(groupId);
    setActiveGroupId(null);
  }, [deleteGroup]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <img src={buzzLogo} alt="Buzz" className="h-14 w-14 rounded-2xl shadow-lg glow-purple animate-pulse object-cover" />
          <p className="text-sm text-muted-foreground">Loading <span className="gradient-brand-text font-semibold">Buzz</span>...</p>
        </div>
      </div>
    );
  }

  if (!session) return <AuthPage onAuth={() => {}} />;

  const isMobileChatOpen = (!!activeChatId || !!activeGroupId) && isStreamsSection;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <InstallPrompt />
      {/* Call screen overlay */}
      {callState !== "idle" && (
        <CallScreen
          callState={callState}
          callType={callType}
          remoteProfile={remoteProfile}
          callDuration={callDuration}
          localVideoRef={localVideoRef as React.RefObject<HTMLVideoElement>}
          remoteVideoRef={remoteVideoRef as React.RefObject<HTMLVideoElement>}
          onEndCall={endCall}
          onAccept={acceptCall}
          onReject={rejectCall}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
        />
      )}

      {/* Desktop sidebar nav */}
      <div className="hidden lg:flex">
        <NavIconBar active={activeSection} onNavigate={handleNavigate} />
      </div>

      {/* Left panel */}
      <div className={`h-full w-full flex-shrink-0 border-r border-border lg:w-[380px] ${isMobileChatOpen ? "hidden lg:block" : "block"}`}>
        {isStreamsSection ? (
          showGroups ? (
            <GroupSidebar
              groups={groups}
              activeGroupId={activeGroupId}
              onSelectGroup={handleSelectGroup}
              onCreateGroup={handleCreateGroup}
              onBack={() => setShowGroups(false)}
            />
          ) : (
            <ChatSidebar
              threads={threads}
              profiles={profiles}
              activeChatId={activeChatId}
              onSelectChat={setActiveChatId}
              onStartChat={handleStartChat}
              username={username}
              onNavigate={handleNavigate}
              onToggleGroups={handleToggleGroups}
            />
          )
        ) : (
          <SectionPanel
            section={activeSection}
            onBack={() => setActiveSection("streams")}
            username={username}
            currentUserId={currentUserId}
            onStartChat={handleStartChat}
            moments={moments}
            onPostMoment={postMoment}
            onDeleteMoment={deleteMoment}
            groups={groups}
            onCreateGroup={handleCreateGroup}
            onSelectGroup={handleSelectGroup}
            onStartCall={handleStartCall}
          />
        )}
      </div>

      {/* Right panel */}
      <div className={`h-full flex-1 ${isMobileChatOpen ? "block" : "hidden lg:block"}`}>
        {isStreamsSection && activeGroupId && activeGroup ? (
          <GroupChatWindow
            group={activeGroup}
            currentUserId={currentUserId!}
            onSendMessage={sendGroupMessage}
            fetchMessages={fetchGroupMessages}
            fetchMembers={fetchGroupMembers}
            onAddMember={addMember}
            onRemoveMember={removeMember}
            onDeleteGroup={handleDeleteGroup}
            onBack={() => setActiveGroupId(null)}
          />
        ) : isStreamsSection && activeThread ? (
          <ChatWindow
            thread={activeThread}
            currentUserId={currentUserId!}
            onSendMessage={handleSendMessage}
            onDeleteMessage={deleteMessage}
            onEditMessage={editMessage}
            onTyping={sendTyping}
            isOtherTyping={isOtherTyping}
            onBack={() => setActiveChatId(null)}
            onStartCall={handleStartCall}
          />
        ) : (
          <EmptyChat />
        )}
      </div>

      {/* Mobile bottom nav */}
      {!isMobileChatOpen && (
        <MobileBottomNav active={activeSection} onNavigate={handleNavigate} unreadCount={totalUnread} />
      )}
    </div>
  );
};

export default Index;
