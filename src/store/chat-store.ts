import { create } from "zustand";
import { Channel, Message, User, ChannelType } from "@prisma/client";

interface ChatStore {
  channels: Channel[];
  selectedChannelId: string | null;
  setChannels: (channels: Channel[]) => void;
  setSelectedChannelId: (id: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  channels: [],
  selectedChannelId: null,
  setChannels: (channels) => set({ channels }),
  setSelectedChannelId: (id) => set({ selectedChannelId: id }),
}));
