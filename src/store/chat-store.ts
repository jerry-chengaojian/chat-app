import { create } from "zustand";
import { Channel, Message, User, ChannelType } from "@prisma/client";

interface ChatMessage extends Message {
  fromUser: User;
}

interface ChatStore {
  channels: Channel[];
  selectedChannelId: string | null;
  messages: ChatMessage[];
  setChannels: (channels: Channel[]) => void;
  setSelectedChannelId: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  channels: [],
  selectedChannelId: null,
  messages: [],
  setChannels: (channels) => set({ channels }),
  setSelectedChannelId: (id) => set({ selectedChannelId: id }),
  addMessage: (message) => 
    set((state) => ({ 
      messages: [...state.messages, message] 
    })),
  setMessages: (messages) => set({ messages }),
}));
