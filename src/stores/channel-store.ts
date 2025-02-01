import { create } from "zustand";
import { produce } from "immer";
import { Channel, ChannelType } from "@prisma/client";
import socket from "@/lib/socket-client";
import { ChatMessage, useMessageStore } from "./message-store";
import { useUserStore } from "./user-store";
import { CHANNEL_CREATE_OR_GET, CHANNEL_JOIN, CHANNEL_MARK_READ } from "@/config/constants";

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
  createOrGetChannel: (userIds: string[], channelType: ChannelType, name: string | null) => Promise<void>;
  addChannel: (channel: ChatChannel) => void;
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
  createOrGetChannel: async (userIds: string[], channelType: ChannelType, name: string | null) => {
    return new Promise((resolve, reject) => {
      socket.emit(
        CHANNEL_CREATE_OR_GET,
        userIds,
        channelType,
        name,
        ({ data, error }: { data?: { channel: ChatChannel }, error?: string }) => {
          if (error) {
            reject(error);
            return;
          }
          
          if (data) {
            const { channel } = data;
            set(produce((state: ChannelStore) => {
              if (!state.channels.find(c => c.id === channel.id)) {
                state.channels.unshift(channel);
              } else {
                const channelIndex = state.channels.findIndex(c => c.id === channel.id);
                if (channelIndex !== -1) {
                  const [existingChannel] = state.channels.splice(channelIndex, 1);
                  state.channels.unshift(existingChannel);
                }
              }
              state.selectedChannelId = channel.id;
            }));
            get().handleChannelClick(channel.id);
            resolve();
          }
        }
      );
    });
  },
  addChannel: (channel) => 
    set(produce((state: ChannelStore) => {
      if (!state.channels.find(c => c.id === channel.id)) {
        state.channels.unshift(channel);
      }
    })),
})); 