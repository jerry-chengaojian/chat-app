"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useChannelStore } from "@/stores/channel-store";

export function ChatList() {
  const [searchQuery, setSearchQuery] = useState("");
  const channels = useChannelStore((state) => state.channels);
  const selectedChannelId = useChannelStore((state) => state.selectedChannelId);
  const { handleChannelClick } = useChannelStore();


  const filteredChannels = channels.filter(channel => 
    channel.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 border-r border-gray-200 flex flex-col">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f5f5f5] rounded-lg text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => handleChannelClick(channel.id)}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 relative",
                "hover:bg-gray-100",
                selectedChannelId === channel.id ? "bg-blue-100 shadow-sm" : "bg-white"
              )}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={undefined}
                    alt={channel.name || "Channel"}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {channel.name?.slice(0, 2).toUpperCase() || "CH"}
                  </AvatarFallback>
                </Avatar>
                {channel.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                    {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">
                    {channel.name || "Unnamed Channel"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {
                      channel.latestMessage && format(new Date(channel.latestMessage.createdAt), "MM-dd HH:mm")
                    }
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {
                    channel.latestMessage && channel.latestMessage.content
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
