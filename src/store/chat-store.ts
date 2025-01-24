import { create } from "zustand";
import { produce, enableMapSet } from "immer";
import { Channel, Message, User, ChannelType } from "@prisma/client";

// Enable the MapSet plugin
enableMapSet();

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
  users: Map<string, User>;
  setChannels: (channels: ChatChannel[]) => void;
  setSelectedChannelId: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setHasMore: (hasMore: boolean) => void;
  prependMessages: (messages: ChatMessage[]) => void;
  updateUnreadCount: (channelId: string, count: number) => void;
  incrementUnreadCount: (channelId: string) => void;
  updateLatestMessage: (message: ChatMessage) => void;
  addUser: (user: User) => void;
  setUsers: (users: User[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  channels: [],
  selectedChannelId: null,
  messages: [],
  hasMore: true,
  users: new Map(),
  setChannels: (channels) => set({ channels }),
  setSelectedChannelId: (id) => set({ selectedChannelId: id }),
  addMessage: (message) => 
    set(produce((state) => {
      state.messages.push(message);
    })),
  setMessages: (messages) => set({ messages }),
  setHasMore: (hasMore) => set({ hasMore }),
  prependMessages: (messages) => 
    set(produce((state) => {
      state.messages.unshift(...messages);
    })),
  updateUnreadCount: (channelId, count) =>
    set(produce((state) => {
      const channel = state.channels.find((c: ChatChannel) => c.id === channelId);
      if (channel) {
        channel.unreadCount = count;
      }
    })),
  incrementUnreadCount: (channelId) =>
    set(produce((state) => {
      const channel = state.channels.find((c: ChatChannel) => c.id === channelId);
      if (channel && channel.id !== state.selectedChannelId) {
        channel.unreadCount = (channel.unreadCount || 0) + 1;
      }
    })),
  updateLatestMessage: (message) =>
    set(produce((state) => {
      const channel = state.channels.find((c: ChatChannel) => c.id === message.channelId);
      if (channel) {
        channel.latestMessage = {
          content: message.content,
          createdAt: message.createdAt
        };
      }
    })),
  addUser: (user: User) => set(produce((state: ChatStore) => {
    state.users.set(user.id, user);
  })),
  setUsers: (users: User[]) => set(produce((state: ChatStore) => {
    state.users = new Map(users.map(user => [user.id, user]));
  })),
}));

