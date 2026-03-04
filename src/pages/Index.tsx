import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import NavIconBar, { type NavSection } from "@/components/chat/NavIconBar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyChat from "@/components/chat/EmptyChat";
import SectionPanel from "@/components/chat/SectionPanel";
import MobileBottomNav from "@/components/chat/MobileBottomNav";
import AuthPage from "@/pages/AuthPage";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import type { Session } from "@supabase/supabase-js";
import buzzLogo from "@/assets/buzz-logo.jpeg";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>("streams");
  const [username, setUsername] = useState<string>("");

  const currentUserId = session?.user?.id;
  const { threads, profiles, sendMessage, markAsRead } = useRealtimeMessages(currentUserId);

  // Auth listener
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

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (activeChatId) {
      markAsRead(activeChatId);
    }
  }, [activeChatId, markAsRead]);

  const activeThread = threads.find((t) => t.id === activeChatId) || null;
  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  const handleSendMessage = useCallback((receiverId: string, text: string) => {
    sendMessage(receiverId, text);
  }, [sendMessage]);

  const handleNavigate = useCallback((section: NavSection) => {
    setActiveSection(section);
    if (section !== "streams") {
      setActiveChatId(null);
    }
  }, []);

  const handleStartChat = useCallback((userId: string) => {
    setActiveChatId(userId);
    setActiveSection("streams");
  }, []);

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

  if (!session) {
    return <AuthPage onAuth={() => {}} />;
  }

  const isStreamsSection = activeSection === "streams";
  const isMobileChatOpen = activeChatId && isStreamsSection;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop left nav */}
      <div className="hidden lg:flex">
        <NavIconBar active={activeSection} onNavigate={handleNavigate} />
      </div>

      {/* Sidebar panel */}
      <div
        className={`h-full w-full flex-shrink-0 border-r border-border lg:w-[380px] ${
          isMobileChatOpen ? "hidden lg:block" : "block"
        }`}
      >
        {isStreamsSection ? (
          <ChatSidebar
            threads={threads}
            profiles={profiles}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onStartChat={handleStartChat}
            username={username}
            onNavigate={handleNavigate}
          />
        ) : (
          <SectionPanel section={activeSection} onBack={() => setActiveSection("streams")} username={username} />
        )}
      </div>

      {/* Main content */}
      <div className={`h-full flex-1 ${isMobileChatOpen ? "block" : "hidden lg:block"}`}>
        {isStreamsSection && activeThread ? (
          <ChatWindow
            thread={activeThread}
            currentUserId={currentUserId!}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveChatId(null)}
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
