"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Users, User } from "lucide-react";

export function LeftSidebar() {
  return (
    <div className="w-16 border-r border-gray-200 flex flex-col items-center py-4 bg-[#f5f5f5]">
      <div className="space-y-4 flex flex-col items-center">
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-50"
          >
            <MessageCircle className="h-6 w-6 text-blue-500" />
          </Button>
          <span className="text-xs text-blue-500">消息</span>
        </div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-xl hover:bg-green-50"
          >
            <Users className="h-6 w-6 text-gray-500" />
          </Button>
          <span className="text-xs text-gray-500">好友</span>
        </div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-xl hover:bg-purple-50"
          >
            <User className="h-6 w-6 text-gray-500" />
          </Button>
          <span className="text-xs text-gray-500">个人</span>
        </div>
      </div>
    </div>
  );
}
