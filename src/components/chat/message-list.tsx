"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
export function MessageList() {
  const messages = useChatStore((state) => state.messages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const selectedChannelId = useChatStore((state) => state.selectedChannelId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 scrollbar-thin">
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
            message.fromUser.id === session?.user?.userId && "flex-row-reverse"
          )}
        >
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
            <AvatarFallback>{message.fromUser.username.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "max-w-[70%]",
              message.fromUser.id === session?.user?.userId && "items-end"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{message.fromUser.username}</span>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleString()}
              </span>
            </div>
            <div
              className={cn(
                "p-3 rounded-lg",
                message.fromUser.id === session?.user?.userId
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
