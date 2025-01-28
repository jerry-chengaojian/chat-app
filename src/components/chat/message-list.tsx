"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChannelStore } from "@/stores/channel-store";
import { useMessageStore } from "@/stores/message-store";
export function MessageList() {
  const messages = useMessageStore(state => state.messages);
  const currentChannelId = useChannelStore(state => state.selectedChannelId);
  const hasMore = useMessageStore(state => state.hasMore);
  const loadMoreMessages = useMessageStore(state => state.loadMoreMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const { data: session } = useSession();

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      const currentScrollHeight = scrollElement.scrollHeight;
      
      // Check if messages were added to the top (loading history)
      const isLoadingHistory = messages.length > 0 && 
        prevScrollHeightRef.current > 0 && 
        messages[0]?.id !== messages[messages.length - 1]?.id;

      if (isLoadingHistory) {
        // When loading history, maintain the relative scroll position
        const heightDiff = currentScrollHeight - prevScrollHeightRef.current;
        scrollElement.scrollTop = scrollElement.scrollTop + heightDiff;
      } else {
        // For new messages, check if user is near bottom
        const isScrolledToBottom = 
          scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight < 50;

        if (isScrolledToBottom || !prevScrollHeightRef.current) {
          // Scroll to bottom for new messages if user was at bottom or on initial load
          scrollElement.scrollTop = currentScrollHeight;
        }
      }
      
      prevScrollHeightRef.current = currentScrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleScroll = async () => {
      if (!scrollRef.current || !hasMore) return;

      const { scrollTop } = scrollRef.current;
      if (scrollTop === 0) {
        const oldestMessageId = messages[0]?.id;
        loadMoreMessages(currentChannelId!, oldestMessageId);
      }
    };

    const scrollElement = scrollRef.current;
    scrollElement?.addEventListener('scroll', handleScroll);
    return () => scrollElement?.removeEventListener('scroll', handleScroll);
  }, [messages, currentChannelId, hasMore]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 scrollbar-thin">
      {!hasMore && messages.length > 0 && ((scrollRef.current?.scrollHeight ?? 0) > (scrollRef.current?.clientHeight ?? 0)) && (
        <Alert className="mb-4">
          <AlertDescription>
            以上是所有消息记录
          </AlertDescription>
        </Alert>
      )}
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
