import { Socket } from "socket.io";
import { prisma } from "@/lib/prisma";
import { MessageResponse, MESSAGES_LIMIT } from "./message-handlers";

type ChannelResponse<T> = {
  data?: T;
  error?: string;
};

export function createChannelHandlers(socket: Socket) {
  return {
    handleMarkChannelRead: async (
      channelId: string,
      callback: (res: ChannelResponse<void>) => void
    ) => {
      try {
        // Get the latest message ID for the channel
        const latestMessage = await prisma.message.findFirst({
          where: { channelId },
          orderBy: { id: 'desc' },
          select: { id: true }
        });

        if (latestMessage) {
          // Update the clientOffsetId for the user-channel
          await prisma.userChannel.update({
            where: {
              userId_channelId: {
                userId: socket.userId,
                channelId: channelId
              }
            },
            data: {
              clientOffsetId: latestMessage.id
            }
          });
        }
        callback({ data: undefined });
      } catch (error) {
        console.error('Error marking channel as read:', error);
        callback({ error: 'Failed to mark channel as read' });
      }
    },

     handleJoinChannel: async (
      channelId: string,
      callback: (res: MessageResponse<any>) => void
    ) => {
      try {
        const messages = await prisma.message.findMany({
          where: { channelId },
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
        console.error('Error loading messages:', error);
        callback({ error: 'Failed to load messages' });
      }
    },

    handleGetChannelUserIds: async (
      channelId: string,
      callback: (res: ChannelResponse<string[]>) => void
    ) => {
      try {
        const userChannels = await prisma.userChannel.findMany({
          where: { channelId },
          select: { userId: true }
        });
        
        const userIds = userChannels.map(uc => uc.userId);
        callback({ data: userIds });
      } catch (error) {
        console.error('Error fetching channel user IDs:', error);
        callback({ error: 'Failed to fetch channel user IDs' });
      }
    }
  };
} 