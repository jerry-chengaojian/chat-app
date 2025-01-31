import { Socket } from "socket.io";
import { prisma } from "@/lib/prisma";
import { MESSAGES_LIMIT } from "@/config/constants";

export type MessageResponse<T> = {
  data?: T;
  error?: string;
};

export function createMessageHandlers(socket: Socket) {
  return {
    handleNewMessage: async (
      data: { content: string; channelId: string },
      callback: (res: MessageResponse<any>) => void
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

        socket.broadcast.to(data.channelId).emit('message', message);
        callback({ data: message });
      } catch (error) {
        console.error('Error saving message:', error);
        callback({ error: 'Failed to send message' });
      }
    },
    handleLoadMoreMessages: async (
      { channelId, beforeId }: { channelId: string, beforeId: number },
      callback: (res: MessageResponse<any>) => void
    ) => {
      try {
        const messages = await prisma.message.findMany({
          where: { 
            channelId,
            id: { lt: beforeId }
          },
          include: { fromUser: { select: { username: true, id: true } } },
          orderBy: { createdAt: 'desc' },
          take: MESSAGES_LIMIT,
        });
        
        callback({
          data: {
            messages: messages.reverse(),
            hasMore: messages.length === MESSAGES_LIMIT
          }
        });
      } catch (error) {
        console.error('Error loading more messages:', error);
        callback({ error: 'Failed to load more messages' });
      }
    }
  };
} 