import { useState, useCallback } from "react";
import NavIconBar, { type NavSection } from "@/components/chat/NavIconBar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyChat from "@/components/chat/EmptyChat";
import SectionPanel from "@/components/chat/SectionPanel";
import { chats as initialChats } from "@/data/mockData";
import type { Chat } from "@/data/mockData";

const Index = () => {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>("streams");

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

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

  const isStreamsSection = activeSection === "streams";
  const isMobileChatOpen = activeChatId && isStreamsSection;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className={`${isMobileChatOpen ? "hidden lg:flex" : "flex"}`}>
        <NavIconBar active={activeSection} onNavigate={handleNavigate} />
      </div>

      <div
        className={`h-full w-full flex-shrink-0 border-r border-border lg:w-[380px] ${
          isMobileChatOpen ? "hidden lg:block" : "block"
        }`}
      >
        {isStreamsSection ? (
          <ChatSidebar chats={chats} activeChatId={activeChatId} onSelectChat={setActiveChatId} />
        ) : (
          <SectionPanel section={activeSection} />
        )}
      </div>

      <div className={`h-full flex-1 ${isMobileChatOpen ? "block" : "hidden lg:block"}`}>
        {isStreamsSection && activeChat ? (
          <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} onBack={() => setActiveChatId(null)} />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
};

export default Index;
