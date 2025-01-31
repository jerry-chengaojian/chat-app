import { Socket } from "socket.io";
import { prisma } from "@/lib/prisma";
import { MessageResponse } from "./message-handlers";
import { ChannelType } from "@prisma/client";
import { MESSAGES_LIMIT } from "@/config/constants";

type ChannelResponse<T> = {
  data?: T;
  error?: string;
};

export function createChannelHandlers(socket: Socket) {
  return {
    handleInitialChannels: async () => {
      try {
        const flattenedChannels = await getUserChannels(socket.userId);
        socket.emit('channels', flattenedChannels);

        // Join all user channels
        for (const channel of flattenedChannels) {
          socket.join(channel.id);
        }
        
        return flattenedChannels; // 返回channels数据以便需要时重用
      } catch (error) {
        console.error('Error handling initial channels:', error);
        return [];
      }
    },
    handleMarkChannelRead: async (channelId: string) => {
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
      } catch (error) {
        console.error('Error marking channel as read:', error);
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

async function getUserChannels(userId: string) {
  // Fetch user's channels with flattened structure
  const userChannels = await prisma.userChannel.findMany({
    where: {
      userId: userId
    },
    orderBy: {
      clientOffsetId: 'desc'
    },
    select: {
      channel: {
        select: {
          id: true,
          name: true,
          type: true,
          createdAt: true
        }
      },
      clientOffsetId: true // Add this to get the last read message ID
    },
    take: 10
  });

  // Transform and process channels
  return Promise.all(
    userChannels.map(async (uc) => {
      const channel = uc.channel;
      const message = await prisma.message.findFirst({
        where: { channelId: channel.id },
        orderBy: { createdAt: 'desc' }
      });
      
      // Count unread messages
      const unreadCount = await prisma.message.count({
        where: {
          channelId: channel.id,
          id: {
            gt: uc.clientOffsetId ?? 0 // If clientOffsetId is null, count all messages
          }
        }
      });

      // For private channels, fetch the other user's name
      if (channel.type === ChannelType.private) {
        const otherUser = await prisma.userChannel.findFirst({
          where: {
            channelId: channel.id,
            userId: {
              not: userId
            }
          },
          select: {
            user: {
              select: {
                username: true
              }
            }
          }
        });

        return {
          ...channel,
          name: otherUser?.user.username || 'Unknown User',
          unreadCount,
          latestMessage: message ? {
            content: message.content,
            createdAt: message.createdAt
          } : null
        };
      }

      return {
        ...channel,
        unreadCount,
        latestMessage: message ? {
          content: message.content,
          createdAt: message.createdAt
        } : null
      };
    })
  );
}