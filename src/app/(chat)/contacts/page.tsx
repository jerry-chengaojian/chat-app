"use client";

import { useUserStore } from "@/stores/user-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { CreateGroupModal } from "@/components/modal/create-group";
import { useSession } from "next-auth/react";

export default function ContactsPage() {
  const { data: session } = useSession();
  const users = useUserStore((state) => state.users);
  const usersList = Array.from(users.values()).filter(user => user.id !== session?.user?.userId);
  const [selectedUser, setSelectedUser] = useState<typeof usersList[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const filteredUsers = usersList.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-1">
      <div className="flex flex-col w-[300px] border-r">
        <div className="flex items-center p-4 border-b">
          <h1 className="text-xl font-semibold">好友列表</h1>
          <span className="ml-2 text-sm text-muted-foreground">{usersList.length} 位联系人</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsCreateGroupOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索联系人"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f5f5f5] rounded-lg text-sm focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="divide-y">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer ${
                  selectedUser?.id === user.id ? 'bg-[#4086F4]/10' : ''
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{user.username?.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-medium">{user.username}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-6">
              <div className="flex gap-10">
                <div className="w-20 text-lg text-muted-foreground">用户名</div>
                <div className="text-lg">{selectedUser.username}</div>
              </div>
              <div className="flex gap-10">
                <div className="w-20 text-lg text-muted-foreground">状态</div>
                <div className="text-lg">
                  {selectedUser.isOnline ? '在线' : '离线'}
                </div>
              </div>

              <div className="flex gap-10">
                <div className="w-20 text-lg text-muted-foreground">最后在线</div>
                <div className="text-lg">
                  {new Date(selectedUser.lastPing).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-center">
                <Button className="w-32 h-11 rounded-xl bg-[#4086F4] hover:bg-[#3476E3]">
                  发消息
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateGroupModal
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        users={usersList}
      />
    </div>
  );
} 