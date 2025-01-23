import { create } from "zustand";
import { Channel, Message, User, ChannelType } from "@prisma/client";

interface ChatMessage extends Message {
  fromUser: User;
}

interface ChatStore {
  channels: Channel[];
  selectedChannelId: string | null;
  messages: ChatMessage[];
  hasMore: boolean;
  setChannels: (channels: Channel[]) => void;
  setSelectedChannelId: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setHasMore: (hasMore: boolean) => void;
  prependMessages: (messages: ChatMessage[]) => void;
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
}));
