import { useState, useCallback } from "react";
import NavIconBar from "@/components/chat/NavIconBar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyChat from "@/components/chat/EmptyChat";
import { chats as initialChats } from "@/data/mockData";
import type { Chat } from "@/data/mockData";

const Index = () => {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Icon Nav Bar */}
      <NavIconBar />
      {/* Sidebar */}
      <div
        className={`h-full w-full flex-shrink-0 border-r lg:w-[380px] ${
          activeChatId ? "hidden lg:block" : "block"
        }`}
      >
        <ChatSidebar chats={chats} activeChatId={activeChatId} onSelectChat={setActiveChatId} />
      </div>

      {/* Chat area */}
      <div className={`h-full flex-1 ${activeChatId ? "block" : "hidden lg:block"}`}>
        {activeChat ? (
          <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} onBack={() => setActiveChatId(null)} />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
};

export default Index;
