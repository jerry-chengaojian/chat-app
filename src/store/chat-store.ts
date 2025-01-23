import { create } from "zustand";
import { Channel, Message, User, ChannelType } from "@prisma/client";

interface ChatMessage extends Message {
  fromUser: User;
}

export interface ChatChannel extends Channel {
  unreadCount: number;
  latestMessage?: {
    content: string;
    createdAt: Date;
  } | null;
}

interface ChatStore {
  channels: ChatChannel[];
  selectedChannelId: string | null;
  messages: ChatMessage[];
  hasMore: boolean;
  setChannels: (channels: ChatChannel[]) => void;
  setSelectedChannelId: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setHasMore: (hasMore: boolean) => void;
  prependMessages: (messages: ChatMessage[]) => void;
  updateUnreadCount: (channelId: string, count: number) => void;
  incrementUnreadCount: (channelId: string) => void;
  updateLatestMessage: (message: ChatMessage) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  channels: [],
  selectedChannelId: null,
  messages: [],
  hasMore: true,
  setChannels: (channels) => set({ channels }),
  setSelectedChannelId: (id) => set({ selectedChannelId: id }),
  addMessage: (message) => 
    set((state) => ({ 
      messages: [...state.messages, message] 
    })),
  setMessages: (messages) => set({ messages }),
  setHasMore: (hasMore) => set({ hasMore }),
  prependMessages: (messages) => 
    set((state) => ({ 
      messages: [...messages, ...state.messages]
    })),
  updateUnreadCount: (channelId, count) =>
    set((state) => ({
      channels: state.channels.map(channel =>
        channel.id === channelId
          ? { ...channel, unreadCount: count }
          : channel
      )
    })),
  incrementUnreadCount: (channelId) =>
    set((state) => ({
      channels: state.channels.map(channel =>
        channel.id === channelId && channel.id !== state.selectedChannelId
          ? { ...channel, unreadCount: (channel.unreadCount || 0) + 1 }
          : channel
      )
    })),
  updateLatestMessage: (message) =>
    set((state) => ({
      channels: state.channels.map(channel =>
        channel.id === message.channelId
          ? { ...channel, latestMessage: { content: message.content, createdAt: message.createdAt } }
          : channel
      )
    })),
}));
