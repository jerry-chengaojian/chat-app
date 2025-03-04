"use client";

import { ChatList } from "@/components/chat/chat-list";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { ChannelType } from "@prisma/client";
import { useChannelStore } from "@/stores/channel-store";
import { useUserStore } from "@/stores/user-store";

export default function ChatInterface() {
  const selectedChannelId = useChannelStore((state) => state.selectedChannelId);
  const onlineCount = useUserStore((state) => state.onlineCount);
  const channel = useChannelStore((state) => state.channels).find(channel => channel.id === selectedChannelId);

  return (
    <>
      <ChatList />

      <div className="flex-1 flex flex-col">
        {selectedChannelId ? (
          <>
            <div className="h-14 border-b flex items-center justify-between px-6 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">{channel?.name}</h2>
                {channel?.type == ChannelType.public && <span className="text-sm text-gray-500">当前在线人数: {onlineCount}</span>}
              </div>
            </div>

            <MessageList/>
            <MessageInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h3 className="text-lg font-medium">请选择一个频道开始聊天</h3>
              <p className="mt-2">从左侧列表选择一个聊天频道</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
