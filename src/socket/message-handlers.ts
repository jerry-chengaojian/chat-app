import { Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { MESSAGE_NEW, MESSAGES_LIMIT } from "../config/constants";
import { ChatMessage } from "@/stores/message-store";

export type MessageResponse<T> = {
  data?: T;
  error?: string;
};

export function createMessageHandlers(socket: Socket) {
  return {
    handleNewMessage: async (
      data: { content: string; channelId: string },
      callback: (res: MessageResponse<ChatMessage>) => void
    ) => {
      try {
        const message = await prisma.message.create({
          data: {
            content: data.content,
            fromUserId: socket.userId,
            channelId: data.channelId,
          },
          include: {
            fromUser: {
              select: {
                username: true,
                id: true,
              },
            },
          },
        });

        socket.broadcast.to(data.channelId).emit(MESSAGE_NEW, message);
        callback({ data: message as ChatMessage });
      } catch (error) {
        console.error("Error saving message:", error);
        callback({ error: "Failed to send message" });
      }
    },
    handleLoadMoreMessages: async (
      { channelId, beforeId }: { channelId: string; beforeId: number },
      callback: (
        res: MessageResponse<{ messages: ChatMessage[]; hasMore: boolean }>
      ) => void
    ) => {
      try {
        const messages = await prisma.message.findMany({
          where: {
            channelId,
            id: { lt: beforeId },
          },
          include: { fromUser: { select: { username: true, id: true } } },
          orderBy: { createdAt: "desc" },
          take: MESSAGES_LIMIT,
        });

        callback({
          data: {
            messages: messages.reverse() as ChatMessage[],
            hasMore: messages.length === MESSAGES_LIMIT,
          },
        });
      } catch (error) {
        console.error("Error loading more messages:", error);
        callback({ error: "Failed to load more messages" });
      }
    },
  };
} 