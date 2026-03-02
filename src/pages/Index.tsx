import { useState, useCallback, useEffect } from "react";
import NavIconBar, { type NavSection } from "@/components/chat/NavIconBar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyChat from "@/components/chat/EmptyChat";
import SectionPanel from "@/components/chat/SectionPanel";
import MobileBottomNav from "@/components/chat/MobileBottomNav";
import OnboardingFlow from "@/components/chat/OnboardingFlow";
import { chats as initialChats } from "@/data/mockData";
import type { Chat } from "@/data/mockData";

const Index = () => {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>("streams");
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("buzz_username"));

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleOnboardingComplete = useCallback((name: string) => {
    localStorage.setItem("buzz_username", name);
    setUsername(name);
  }, []);

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

  if (!username) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const isStreamsSection = activeSection === "streams";
  const isMobileChatOpen = activeChatId && isStreamsSection;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop left nav - hidden on mobile */}
      <div className={`hidden lg:flex ${isMobileChatOpen ? "" : ""}`}>
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

      {/* Mobile bottom nav - hidden on desktop */}
      {!isMobileChatOpen && (
        <MobileBottomNav active={activeSection} onNavigate={handleNavigate} unreadCount={totalUnread} />
      )}
    </div>
  );
};

export default Index;
