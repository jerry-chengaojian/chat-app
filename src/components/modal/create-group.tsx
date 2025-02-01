"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { User } from "@prisma/client";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
}

export function CreateGroupModal({ open, onOpenChange, users }: CreateGroupModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">发起群聊</DialogTitle>
          <div className="text-sm text-muted-foreground">
            已选择 {selectedUsers.length} 个联系人
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
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            创建
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 