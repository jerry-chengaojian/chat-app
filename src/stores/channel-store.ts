import { create } from "zustand";
import { produce } from "immer";
import { Channel } from "@prisma/client";
import socket from "@/lib/socket-client";
import { ChatMessage, useMessageStore } from "./message-store";
import { useUserStore } from "./user-store";
import { CHANNEL_JOIN, CHANNEL_MARK_READ } from "@/config/constants";

export interface ChatChannel extends Channel {
  unreadCount: number;
  latestMessage?: {
    content: string;
    createdAt: Date;
  } | null;
}

interface ChannelStore {
  channels: ChatChannel[];
  selectedChannelId: string | null;
  setChannels: (channels: ChatChannel[]) => void;
  setSelectedChannelId: (id: string | null) => void;
  updateUnreadCount: (channelId: string, count: number) => void;
  incrementUnreadCount: (channelId: string) => void;
  updateLatestMessage: (channelId: string, content: string, createdAt: Date) => void;
  handleChannelClick: (channelId: string) => void;
}

export const useChannelStore = create<ChannelStore>((set, get) => ({
  channels: [],
  selectedChannelId: null,
  setChannels: (channels) => set({ channels }),
  setSelectedChannelId: (id) => set({ selectedChannelId: id }),
  updateUnreadCount: (channelId, count) =>
    set(produce((state: ChannelStore) => {
      const channel = state.channels.find((c) => c.id === channelId);
      if (channel) {
        channel.unreadCount = count;
      }
    })),
  incrementUnreadCount: (channelId) =>
    set(produce((state: ChannelStore) => {
      const channel = state.channels.find((c) => c.id === channelId);
      if (channel && channel.id !== state.selectedChannelId) {
        channel.unreadCount = (channel.unreadCount || 0) + 1;
      }
    })),
  updateLatestMessage: (channelId, content, createdAt) =>
    set(produce((state: ChannelStore) => {
      const channelIndex = state.channels.findIndex((c) => c.id === channelId);
      if (channelIndex !== -1) {
        const channel = state.channels[channelIndex];
        state.channels.splice(channelIndex, 1);
        state.channels.unshift(channel);
        channel.latestMessage = { content, createdAt };
      }
    })),
  handleChannelClick: (channelId) => {
    set(produce((state: ChannelStore) => {
      state.selectedChannelId = channelId;
      const channel = state.channels.find((c) => c.id === channelId);
      if (channel) {
        channel.unreadCount = 0;
      }
    }));
    useUserStore.getState().updateOnlineCount(channelId);
    socket.emit(CHANNEL_JOIN, channelId, ({ data }: { data: { messages: ChatMessage[], hasMore: boolean } }) => {
      useMessageStore.getState().setMessages(data.messages);
      useMessageStore.getState().setHasMore(data.hasMore);
    });
    socket.emit(CHANNEL_MARK_READ, channelId);
  },
})); 