"use client";

import { useState } from "react";
import { ChatList } from "@/components/chat/chat-list";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { Message } from "@/types/chat";

export default function ChatInterface() {
  const [selectedChatId, setSelectedChatId] = useState("1");

  // Sample messages data
  const messages: Message[] = [
    {
      id: "1",
      content: "系统消息",
      sender: "system",
      timestamp: "01-13 13:35",
      avatar: "/winter.jpg",
    },
    {
      id: "2",
      content: "hi",
      sender: "dansela",
      timestamp: "01-13 18:54",
      avatar: "/winter.jpg",
    },
    {
      id: "3",
      content: "大家好",
      sender: "qingyise",
      timestamp: "2天前",
      avatar: "/winter.jpg",
    },
    {
      id: "4",
      content: "hi",
      sender: "Jerry",
      timestamp: "01-14 15:30",
      avatar: "/doraemon.jpg",
    },
  ];

  return (
    <>
      <ChatList
        selectedChatId={selectedChatId}
        setSelectedChatId={setSelectedChatId}
      />

      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">静待下班</h2>
            <span className="text-sm text-gray-500">当前在线人数: 4</span>
          </div>
        </div>

        <MessageList messages={messages} />
        <MessageInput />
      </div>
    </>
  );
}
