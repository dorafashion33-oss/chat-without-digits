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
  const [activeSection, setActiveSection] = useState<NavSection>("chat");

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
    if (section !== "chat") {
      setActiveChatId(null);
    }
  }, []);

  const isChatSection = activeSection === "chat";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Icon Nav Bar */}
      <NavIconBar active={activeSection} onNavigate={handleNavigate} />

      {/* Sidebar / Panel */}
      <div
        className={`h-full w-full flex-shrink-0 border-r border-border lg:w-[380px] ${
          activeChatId && isChatSection ? "hidden lg:block" : "block"
        }`}
      >
        {isChatSection ? (
          <ChatSidebar chats={chats} activeChatId={activeChatId} onSelectChat={setActiveChatId} />
        ) : (
          <SectionPanel section={activeSection} />
        )}
      </div>

      {/* Main content area */}
      <div className={`h-full flex-1 ${activeChatId && isChatSection ? "block" : "hidden lg:block"}`}>
        {isChatSection && activeChat ? (
          <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} onBack={() => setActiveChatId(null)} />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
};

export default Index;
