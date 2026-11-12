import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import GroupChatWindow from "@/components/chat/GroupChatWindow";
import EmptyChat from "@/components/chat/EmptyChat";
import CallScreen from "@/components/chat/CallScreen";
import GroupCallScreen from "@/components/chat/GroupCallScreen";
import NavIconBar from "@/components/chat/NavIconBar";
import MobileBottomNav from "@/components/chat/MobileBottomNav";
import SectionPanel from "@/components/chat/SectionPanel";
import BuzzLanding from "./BuzzLanding";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useGroups } from "@/hooks/useGroups";
import { useGroupCall } from "@/hooks/useGroupCall";
import { ChatThemeProvider } from "@/components/chat/ChatThemeProvider";
import NewFeatureSpotlight from "@/components/chat/NewFeatureSpotlight";
import BuzzLogoAnimation from "@/components/chat/BuzzLogoAnimation";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"streams" | "moments" | "connect" | "discover">("streams");
  const location = useLocation();

  const {
    callState,
    callType,
    remoteProfile,
    callDuration,
    startCall,
    answerCall,
    endCall,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoMuted,
    localVideoRef,
    remoteVideoRef,
  } = useWebRTC(user?.id);

  const {
    groups,
    createGroup,
    deleteGroup,
    refetch: refetchGroups,
  } = useGroups(user?.id);

  const {
    groupCall,
    participants: groupParticipants,
    joinGroupCall,
    leaveGroupCall,
    toggleGroupAudio,
    toggleGroupVideo,
    isAudioMuted: isGroupAudioMuted,
    isVideoMuted: isGroupVideoMuted,
    localStream: groupLocalStream,
    isHost: isGroupCallHost,
  } = useGroupCall(user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSelectChat = useCallback((threadId: string) => {
    setActiveChatId(threadId);
    setActiveGroupId(null);
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

  // 10/10 Logo Animation on Loading Screen
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <BuzzLogoAnimation size="lg" showAura={true} showTagline={true} />
        </div>
      </div>
    );
  }

  if (!session) return <BuzzLanding page={location.pathname} />;

  const isMobileChatOpen = (!!activeChatId || !!activeGroupId) && activeSection === "streams";

  return (
    <ChatThemeProvider key={session.user.id} userId={session.user.id}>
      <NewFeatureSpotlight userId={session.user.id} />
      <div className="flex h-dvh min-h-0 w-full min-w-0 overflow-hidden bg-background">
        {/* Call screen overlay */}
        {callState !== "idle" && (
          <CallScreen
            callState={callState}
            callType={callType}
            remoteProfile={remoteProfile}
            callDuration={callDuration}
            localVideoRef={localVideoRef as React.RefObject<HTMLVideoElement>}
            remoteVideoRef={remoteVideoRef as React.RefObject<HTMLVideoElement>}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            onAnswer={answerCall}
            onEnd={endCall}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
          />
        )}

        {/* Group Call Overlay */}
        {groupCall && (
          <GroupCallScreen
            groupCall={groupCall}
            participants={groupParticipants}
            currentUserId={session.user.id}
            localStream={groupLocalStream}
            isAudioMuted={isGroupAudioMuted}
            isVideoMuted={isGroupVideoMuted}
            isHost={isGroupCallHost}
            onLeave={leaveGroupCall}
            onToggleAudio={toggleGroupAudio}
            onToggleVideo={toggleGroupVideo}
          />
        )}

        {/* Desktop Icon Sidebar */}
        <NavIconBar
          activeSection={activeSection}
          onSelectSection={(sec) => {
            setActiveSection(sec);
            if (sec !== "streams") {
              setActiveChatId(null);
              setActiveGroupId(null);
            }
          }}
          userId={session.user.id}
        />

        {/* Left Drawer / Panel */}
        <div className={`h-full border-r border-border flex flex-col ${
          isMobileChatOpen ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 shrink-0`}>
          {activeSection === "streams" ? (
            <ChatSidebar
              activeChatId={activeChatId}
              onSelectChat={handleSelectChat}
              activeGroupId={activeGroupId}
              onSelectGroup={handleSelectGroup}
              groups={groups}
              onCreateGroup={handleCreateGroup}
              userId={session.user.id}
            />
          ) : (
            <SectionPanel
              section={activeSection}
              userId={session.user.id}
              onStartChat={(otherUserId) => {
                setActiveSection("streams");
                handleSelectChat(otherUserId);
              }}
              onStartCall={handleStartCall}
            />
          )}
        </div>

        {/* Right Chat Panel */}
        <div className={`h-full flex-1 flex flex-col min-w-0 ${
          isMobileChatOpen ? "flex" : "hidden md:flex"
        }`}>
          {activeGroupId ? (
            <GroupChatWindow
              groupId={activeGroupId}
              currentUserId={session.user.id}
              onBack={() => setActiveGroupId(null)}
              onDeleteGroup={handleDeleteGroup}
              onStartGroupCall={(callType) => joinGroupCall(activeGroupId, callType)}
            />
          ) : activeChatId ? (
            <ChatWindow
              threadId={activeChatId}
              currentUserId={session.user.id}
              onBack={() => setActiveChatId(null)}
              onStartCall={handleStartCall}
            />
          ) : (
            <EmptyChat />
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeSection={activeSection}
          onSelectSection={(sec) => {
            setActiveSection(sec);
            setActiveChatId(null);
            setActiveGroupId(null);
          }}
          hidden={isMobileChatOpen}
        />
      </div>
    </ChatThemeProvider>
  );
};

export default Index;
