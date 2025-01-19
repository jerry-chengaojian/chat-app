"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatListProps {
  selectedChatId: string;
  setSelectedChatId: (id: string) => void;
}

export function ChatList({ selectedChatId, setSelectedChatId }: ChatListProps) {
  return (
    <div className="w-64 border-r border-gray-200 flex flex-col">
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

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
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
          {/* Additional chat items... */}
        </div>
      </div>
    </div>
  );
}
