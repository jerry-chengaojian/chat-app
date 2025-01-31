import { create } from "zustand";
import { produce } from "immer";
import { Message, User } from "@prisma/client";
import socket from "@/lib/socket-client";
import { useUserStore } from "./user-store";
import { MESSAGE_SEND, MESSAGE_LOAD_MORE } from "@/config/constants";

export interface ChatMessage extends Message {
  fromUser: User;
}

interface MessageStore {
  messages: ChatMessage[];
  hasMore: boolean;
  setMessages: (messages: ChatMessage[]) => void;
  setHasMore: (hasMore: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  prependMessages: (messages: ChatMessage[]) => void;
  loadMoreMessages: (channelId: string, beforeId: number) => void;
  sendMessage: (content: string, userId: string, channelId: string) => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  hasMore: true,
  setMessages: (messages) => set({ messages }),
  setHasMore: (hasMore) => set({ hasMore }),
  addMessage: (message) => 
    set(produce((state) => {
      state.messages.push(message);
    })),
  prependMessages: (messages) => 
    set(produce((state) => {
      state.messages.unshift(...messages);
    })),
  loadMoreMessages: (channelId, beforeId) => {
    socket.emit(MESSAGE_LOAD_MORE, { channelId, beforeId }, ({ data }: { data: { messages: ChatMessage[], hasMore: boolean } }) => {
      set(produce((state: MessageStore) => {
        state.messages.unshift(...data.messages);
        state.hasMore = data.hasMore;
      }));
    });
  },
  sendMessage: (content, userId, channelId) => {
    if (!content.trim() || !channelId) return;

    const tempMessage: ChatMessage = {
      id: Date.now(),
      content: content.trim(),
      channelId,
      createdAt: new Date(),
      fromUserId: userId,
      fromUser: useUserStore.getState().users.get(userId) as User,
    };

    set(produce((state) => {
      state.messages.push(tempMessage);
    }));

    socket.emit(MESSAGE_SEND, {
      content: content.trim(),
      channelId,
    }, ({ data }: { data: ChatMessage }) => {
      set(produce((state: MessageStore) => {
        const index = state.messages.findIndex(msg => msg.id === tempMessage.id);
        if (index !== -1) {
          state.messages[index] = data;
        }
      }));
    });
  },
})); 