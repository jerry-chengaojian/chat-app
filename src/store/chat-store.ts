import { create } from "zustand";
import { produce, enableMapSet } from "immer";
import { Channel, Message, User, ChannelType } from "@prisma/client";
import socket from "@/lib/socket";

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
  handleChannelClick: (channelId: string) => void;
  loadMoreMessages: (channelId: string, beforeId: number) => void;
  sendMessage: (content: string, userId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
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
  handleChannelClick: (channelId: string) => {
    set(produce((state: ChatStore) => {
      state.selectedChannelId = channelId;
      const channel = state.channels.find((c) => c.id === channelId);
      if (channel) {
        channel.unreadCount = 0;
      }
    }))
    socket.emit("join_channel", channelId, ({ data }: { data: {messages: ChatMessage[], hasMore: boolean} }) => {
      set({ messages: data.messages, hasMore: data.hasMore });
    });
    socket.emit("mark_channel_read", channelId);
  },
  loadMoreMessages: (channelId: string, beforeId: number) => {
    socket.emit('load_more_messages', { channelId, beforeId }, ({ data }: { data: {messages: ChatMessage[], hasMore: boolean} }) => {
      set(produce((state: ChatStore) => {
        state.messages.unshift(...data.messages);
        state.hasMore = data.hasMore;
      }));
    });
  },
  sendMessage: (content: string, userId: string) => {
    const { selectedChannelId } = get();
    if (!content.trim() || !selectedChannelId) return;

    // Create a temporary message
    const message: ChatMessage = {
      id: Date.now(), // temporary id
      content: content.trim(),
      channelId: selectedChannelId,
      createdAt: new Date(),
      fromUserId: userId,
      fromUser: get().users.get(userId) as User, // Use current user
    };
    // Add temporary message immediately
    set(produce((state: ChatStore) => {
      state.messages.push(message);
    }));

    // Send to server
    socket.emit("message:send", {
      content: content.trim(),
      channelId: selectedChannelId,
    }, ({ data }: { data: ChatMessage }) => {
      // Replace temporary message with real one
      set(produce((state: ChatStore) => {
        const index = state.messages.findIndex(msg => msg.id === message.id);
        if (index !== -1) {
          state.messages[index] = data;
        }
      }));
    });
  },
}));

