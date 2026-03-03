import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import NavIconBar, { type NavSection } from "@/components/chat/NavIconBar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyChat from "@/components/chat/EmptyChat";
import SectionPanel from "@/components/chat/SectionPanel";
import MobileBottomNav from "@/components/chat/MobileBottomNav";
import AuthPage from "@/pages/AuthPage";
import { chats as initialChats } from "@/data/mockData";
import type { Chat } from "@/data/mockData";
import type { Session } from "@supabase/supabase-js";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>("streams");
  const [username, setUsername] = useState<string>("");

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

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleSendMessage = useCallback((chatId: string, text: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: `m-${Date.now()}`,
                  senderId: "me",
                  text,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  status: "sent" as const,
                },
              ],
              lastMessage: text,
              lastMessageTime: "Now",
            }
          : chat
      )
    );
  }, []);

  const handleNavigate = useCallback((section: NavSection) => {
    setActiveSection(section);
    if (section !== "streams") {
      setActiveChatId(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground animate-pulse">B</div>
          <p className="text-sm text-muted-foreground">Loading Buzz...</p>
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
          <ChatSidebar chats={chats} activeChatId={activeChatId} onSelectChat={setActiveChatId} username={username} onNavigate={handleNavigate} />
        ) : (
          <SectionPanel section={activeSection} onBack={() => setActiveSection("streams")} username={username} />
        )}
      </div>

      {/* Main content */}
      <div className={`h-full flex-1 ${isMobileChatOpen ? "block" : "hidden lg:block"}`}>
        {isStreamsSection && activeChat ? (
          <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} onBack={() => setActiveChatId(null)} />
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
