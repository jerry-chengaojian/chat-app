"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Users,
  Group,
  Search,
  Smile,
  Paperclip,
  Image,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Message type definition
type Message = {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  avatar?: string;
};

export default function ChatInterface() {
  // Add selected chat state
  const [selectedChatId, setSelectedChatId] = useState("1"); // Default to first chat

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
    <div className="flex justify-center items-center min-h-screen bg-[#e5f0f6] pt-12 pb-12 pl-36 pr-36">
      <div className="flex w-full max-w-6xl h-[82vh] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left sidebar */}
        <div className="w-16 border-r border-gray-200 flex flex-col items-center py-4 bg-[#f5f5f5]">
          {/* Navigation buttons */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-xl bg-blue-50 hover:bg-blue-50"
              >
                <MessageCircle className="h-6 w-6 text-blue-500" />
              </Button>
              <span className="text-xs text-blue-500 mt-1">消息</span>
            </div>

            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-green-50"
              >
                <Users className="h-6 w-6 text-gray-500" />
              </Button>
              <span className="text-xs text-gray-500 mt-1">好友</span>
            </div>

            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-purple-50"
              >
                <Group className="h-6 w-6 text-gray-500" />
              </Button>
              <span className="text-xs text-gray-500 mt-1">群组</span>
            </div>
          </div>
        </div>

        {/* Chat list sidebar */}
        <div className="w-64 border-r border-gray-200 flex flex-col">
          {/* Search bar */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索"
                className="w-full pl-9 pr-4 py-2 bg-[#f5f5f5] rounded-lg text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1 p-2">
              {/* Chat items */}
              <div
                onClick={() => setSelectedChatId("1")}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200",
                  "hover:bg-gray-100",
                  selectedChatId === "1" ? "bg-blue-100 shadow-sm" : "bg-white"
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src="/doraemon.jpg"
                    alt="System"
                    className="object-cover"
                  />
                  <AvatarFallback>SY</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">系统消息</span>
                    <span className="text-xs text-gray-500">01-16</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    Welcome to the chat!
                  </p>
                </div>
              </div>
              <div
                onClick={() => setSelectedChatId("2")}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200",
                  "hover:bg-gray-100",
                  selectedChatId === "2" ? "bg-blue-100 shadow-sm" : "bg-white"
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src="/winter.jpg"
                    alt="System"
                    className="object-cover"
                  />
                  <AvatarFallback>SY</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">静待下班</span>
                    <span className="text-xs text-gray-500">01-15</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    你还有钱吗？没有我给你打点。
                  </p>
                </div>
              </div>

              {/* Additional chat items... */}
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="h-14 border-b flex items-center justify-between px-6 bg-white">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">静待下班</h2>
              <span className="text-sm text-gray-500">当前在线人数: 4</span>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 scrollbar-thin">
            <style jsx global>{`
              .scrollbar-thin::-webkit-scrollbar {
                width: 4px;
              }

              .scrollbar-thin::-webkit-scrollbar-track {
                background: transparent;
              }

              .scrollbar-thin::-webkit-scrollbar-thumb {
                background-color: #cbd5e1;
                border-radius: 20px;
              }

              .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background-color: #94a3b8;
              }
            `}</style>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.sender === "Jerry" && "flex-row-reverse"
                )}
              >
                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                  <AvatarImage
                    src={message.avatar}
                    alt={message.sender}
                    className="object-cover"
                  />
                  <AvatarFallback>{message.sender[0]}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[70%]",
                    message.sender === "Jerry" && "items-end"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.sender}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-lg",
                      message.sender === "Jerry"
                        ? "bg-blue-500 text-white"
                        : "bg-white shadow-sm"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="border-t bg-white p-4">
            <div className="flex gap-2">
              <Textarea
                className="flex-1 min-h-[80px] resize-none focus-visible:ring-0 focus-visible:border-gray-400 border-gray-200"
                placeholder="输入消息..."
              />
            </div>
            <div className="text-xs text-gray-500 mt-2 flex justify-between items-center gap-2">
              <div className="flex gap-2 mb-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Image className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Paperclip className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <div>Ctrl+Enter: 换行 | Enter: 发送</div>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Send className="h-4 w-4 mr-2" />
                  发送
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
