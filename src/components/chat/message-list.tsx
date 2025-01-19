"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  avatar?: string;
};

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
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
              <span className="text-sm font-medium">{message.sender}</span>
              <span className="text-xs text-gray-500">{message.timestamp}</span>
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
  );
}
