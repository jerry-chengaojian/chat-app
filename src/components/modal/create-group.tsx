"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { ChannelType, User } from "@prisma/client";
import { useChannelStore } from "@/stores/channel-store";
import { useRouter } from "next/navigation";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
}

export function CreateGroupModal({ open, onOpenChange, users }: CreateGroupModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const createOrGetChannel = useChannelStore((state) => state.createOrGetChannel);
  const router = useRouter();
  const [channelName, setChannelName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length === 0 || !channelName.trim()) return;
    
    setIsLoading(true);
    try {
      const userIds = selectedUsers.map(user => user.id);
      await createOrGetChannel(userIds, ChannelType.public, channelName.trim());
      onOpenChange(false);
      router.push('/');
    } catch (error) {
      setError(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-8 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
        <DialogHeader>
          <DialogTitle className="flex justify-between">
            <div className="text-2xl font-semibold text-gray-900">
              发起群聊
            </div>
            <div className="relative">
              <Input
                placeholder="请输入群组名称"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-60"
              />
            </div>
          </DialogTitle>
          <div>
            <div className="text-sm text-muted-foreground">
              已选择 {selectedUsers.length} 个联系人
            </div>
            {error && <div className="text-red-500">{error}</div>}
          </div>
        </DialogHeader>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/30"
          />
        </div>

        {/* 已选用户预览 */}
        {selectedUsers.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedUsers.map((user) => (
              <div key={user.id} className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>{user.username?.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => toggleUserSelection(user)}
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-background border shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 用户列表 */}
        <div className="max-h-[300px] overflow-auto -mx-6 px-6">
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2 hover:bg-muted/50 cursor-pointer rounded-lg"
                onClick={() => toggleUserSelection(user)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{user.username?.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span>{user.username}</span>
                </div>
                {selectedUsers.find(u => u.id === user.id) && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl border-[#4086F4] hover:bg-[#F5F7FA]"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl bg-[#4086F4] hover:bg-[#3476E3]"
            onClick={handleCreateGroup}
            disabled={isLoading || selectedUsers.length === 0 || !channelName.trim()}
          >
            {isLoading ? "创建中..." : "创建"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 