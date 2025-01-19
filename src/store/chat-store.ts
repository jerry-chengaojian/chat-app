import { create } from "zustand";
import { socket } from "@/lib/socket"; // You'll need to create this socket service

interface User {
  id: string;
  username: string;
  isOnline?: boolean;
}

interface Message {
  id: string;
  content: string;
  from: string;
  channelId: string;
}

interface Channel {
  id: string;
  name: string;
  type: "public" | "private";
  messages: Message[];
  messageInput: string;
  hasMore: boolean;
  isLoaded: boolean;
  typingUsers: Map<string, User>;
  unreadCount: number;
}

interface ChatStore {
  channels: Map<string, Channel>;
  users: Map<string, User>;
  selectedChannelId: string | undefined;

  // Actions
  init: () => void;
  bindEvents: () => void;
  clear: () => void;
  addChannel: (channel: Partial<Channel>) => void;
  selectChannel: (channelId: string) => Promise<void>;
  sendMessage: (currentUserId: string, content: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  channels: new Map(),
  users: new Map(),
  selectedChannelId: undefined,

  init: async () => {
    socket.connect();
  },

  bindEvents: () => {
    socket.on("channel:created", (channel) => get().addChannel(channel));
    socket.on("channel:joined", (channel) => get().addChannel(channel));
    socket.on("message:sent", (message) => {
      // Add message handling logic
    });
  },

  clear: () => {
    // Remove all socket event listeners
    socket.off("channel:created");
    socket.off("channel:joined");
    socket.off("message:sent");
    socket.disconnect();

    set({
      channels: new Map(),
      users: new Map(),
      selectedChannelId: undefined,
    });
  },

  addChannel: (channel) => {
    const channels = get().channels;

    if (channels.has(channel.id!)) {
      const existingChannel = channels.get(channel.id!)!;
      Object.assign(existingChannel, channel);
      existingChannel.isLoaded = false;
      existingChannel.typingUsers.clear();
    } else {
      const newChannel: Channel = {
        ...channel,
        messageInput: "",
        messages: [],
        hasMore: false,
        isLoaded: false,
        typingUsers: new Map(),
        unreadCount: 0,
      } as Channel;
      channels.set(channel.id!, newChannel);
    }
    set({ channels: new Map(channels) });
  },

  selectChannel: async (channelId) => {
    set({ selectedChannelId: channelId });
    // Add message loading logic
  },

  sendMessage: async (currentUserId, content) => {
    const { selectedChannelId } = get();

    if (!selectedChannelId) return;

    const message = {
      id: undefined,
      from: currentUserId,
      channelId: selectedChannelId,
      content,
    };

    // Add message sending logic
    const res = await socket.emitWithAck("message:send", {
      channelId: selectedChannelId,
      content,
    });

    if (res.status === "OK") {
      // Update message with server response
    }
  },
}));
