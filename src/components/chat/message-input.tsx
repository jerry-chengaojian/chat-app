"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Image as ImageIcon, Paperclip, Send } from "lucide-react";
import { useState, KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import { useChannelStore } from "@/stores/channel-store";
import { useMessageStore } from "@/stores/message-store";

export function MessageInput() {
  const [content, setContent] = useState("");
  const selectedChannelId = useChannelStore((state) => state.selectedChannelId);
  const sendMessage = useMessageStore((state) => state.sendMessage);
  const { data: session } = useSession();

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim() || !selectedChannelId) return;
    sendMessage(content, session!.user.userId!, selectedChannelId);
    setContent("");
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-h-[80px] resize-none focus-visible:ring-0 focus-visible:border-gray-400 border-gray-200"
          placeholder="输入消息..."
        />
      </div>
      <div className="text-xs text-gray-500 mt-2 flex justify-between items-center gap-2">
        <div className="flex mb-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Smile className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <div>Ctrl+Enter: 换行 | Enter: 发送</div>
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={handleSend}
            disabled={!content.trim() || !selectedChannelId}
          >
            <Send className="h-4 w-4 mr-2" />
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}
