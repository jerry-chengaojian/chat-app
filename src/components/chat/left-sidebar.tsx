"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Users, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LeftSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-16 border-r border-gray-200 flex flex-col items-center py-4 bg-[#f5f5f5]">
      <div className="space-y-4 flex flex-col items-center">
        <Link href="/" className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`w-8 h-8 rounded-xl ${
              pathname === "/" ? "bg-blue-50 hover:bg-blue-50" : "hover:bg-blue-50"
            }`}
          >
            <MessageCircle className={`h-6 w-6 ${pathname === "/" ? "text-blue-500" : "text-gray-500"}`} />
          </Button>
          <span className={`text-xs ${pathname === "/" ? "text-blue-500" : "text-gray-500"}`}>消息</span>
        </Link>

        <Link href="/contacts" className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`w-8 h-8 rounded-xl ${
              pathname === "/contacts" ? "bg-blue-50 hover:bg-blue-50" : "hover:bg-blue-50"
            }`}
          >
            <Users className={`h-6 w-6 ${pathname === "/contacts" ? "text-blue-500" : "text-gray-500"}`} />
          </Button>
          <span className={`text-xs ${pathname === "/contacts" ? "text-blue-500" : "text-gray-500"}`}>好友</span>
        </Link>

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
