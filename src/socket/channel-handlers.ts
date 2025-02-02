import { Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { MessageResponse } from "./message-handlers";
import { ChannelType } from "@prisma/client";
import { CHANNEL_ADDED, CHANNEL_LIST, MESSAGES_LIMIT } from "../config/constants";
import { ChatMessage } from "@/stores/message-store";
import { ChatChannel } from "@/stores/channel-store";

type ChannelResponse<T> = {
  data?: T;
  error?: string;
};

export function createChannelHandlers(socket: Socket) {
  return {
    handleInitialChannels: async () => {
      try {
        const flattenedChannels = await getUserChannels(socket.userId);
        socket.emit(CHANNEL_LIST, flattenedChannels);

        // Join all user channels
        for (const channel of flattenedChannels) {
          socket.join(channel.id);
        }

        return flattenedChannels; // 返回channels数据以便需要时重用
      } catch (error) {
        console.error("Error handling initial channels:", error);
        return [];
      }
    },
    handleMarkChannelRead: async (channelId: string) => {
      try {
        // Get the latest message ID for the channel
        const latestMessage = await prisma.message.findFirst({
          where: { channelId },
          orderBy: { id: "desc" },
          select: { id: true },
        });

        if (latestMessage) {
          // Update the clientOffsetId for the user-channel
          await prisma.userChannel.update({
            where: {
              userId_channelId: {
                userId: socket.userId,
                channelId: channelId,
              },
            },
            data: {
              clientOffsetId: latestMessage.id,
            },
          });
        }
      } catch (error) {
        console.error("Error marking channel as read:", error);
      }
    },

    handleJoinChannel: async (
      channelId: string,
      callback: (
        res: MessageResponse<{ messages: ChatMessage[]; hasMore: boolean }>
      ) => void
    ) => {
      try {
        const messages = await prisma.message.findMany({
          where: { channelId },
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
        console.error("Error loading messages:", error);
        callback({ error: "Failed to load messages" });
      }
    },

    handleGetChannelUserIds: async (
      channelId: string,
      callback: (res: ChannelResponse<string[]>) => void
    ) => {
      try {
        const userChannels = await prisma.userChannel.findMany({
          where: { channelId },
          select: { userId: true },
        });

        const userIds = userChannels.map((uc) => uc.userId);
        callback({ data: userIds });
      } catch (error) {
        console.error("Error fetching channel user IDs:", error);
        callback({ error: "Failed to fetch channel user IDs" });
      }
    },

    handleCreateOrGetChannel: async (
      userIds: string[],
      channelType: ChannelType,
      name: string | null,
      callback: (res: ChannelResponse<{ channel: ChatChannel }>) => void
    ) => {
      try {
        if (channelType === ChannelType.private && userIds.length !== 1) {
          callback({ error: "Private channels must have exactly one target user" });
          return;
        }

        if (channelType === ChannelType.public) {
          if (!name?.trim()) {
            callback({ error: "群组名称不能为空" });
            return;
          }

          // Check if channel name already exists
          const existingChannel = await prisma.channel.findFirst({
            where: {
              name: name.trim(),
              type: ChannelType.public
            }
          });

          if (existingChannel) {
            callback({ error: "群组名称已存在" });
            return;
          }
        }

        // Include the current user in the userIds array
        const allUserIds = [socket.userId, ...userIds];

        // For private channels, check if channel already exists
        if (channelType === ChannelType.private) {
          const existingChannel = await prisma.channel.findFirst({
            where: {
              type: channelType,
              userChannels: {
                every: {
                  userId: {
                    in: allUserIds
                  }
                }
              }
            },
            include: {
              userChannels: true
            }
          });

          if (existingChannel) {
            const channelData = (await getUserChannels(socket.userId, existingChannel.id))
              .find(c => c.id === existingChannel.id);
            
            if (channelData) {
              if (!socket.rooms.has(existingChannel.id)) {
                socket.join(existingChannel.id);
              }
              callback({ data: { channel: channelData } });
              return;
            }
          }
        }

        // Create new channel
        const newChannel = await prisma.channel.create({
          data: {
            type: channelType,
            name: channelType === ChannelType.public ? name?.trim() : undefined,
            userChannels: {
              create: allUserIds.map(userId => ({ userId }))
            }
          }
        });

        const channelData = (await getUserChannels(socket.userId, newChannel.id))
          .find(c => c.id === newChannel.id);

        if (channelData) {
          socket.join(newChannel.id);
          
          // Notify other users about the new channel
          allUserIds.forEach(userId => {
            socket.to(userId).emit(CHANNEL_ADDED, channelData);
          });
          
          callback({ data: { channel: channelData } });
        }
      } catch (error) {
        console.error("Error creating/getting channel:", error);
        callback({ error: "Failed to create/get channel" });
      }
    },

    handleJoinChannelRoom: async (channelId: string, callback: (res: ChannelResponse<{ channel: ChatChannel }>) => void) => {
      try {
        // Verify user has access to this channel
        const hasAccess = await prisma.userChannel.findFirst({
          where: {
            channelId,
            userId: socket.userId
          }
        });

        if (!hasAccess) {
          console.error(`User ${socket.userId} attempted to join unauthorized channel ${channelId}`);
          return;
        }
        const channelData = (await getUserChannels(socket.userId, channelId))
          .find(c => c.id === channelId);
        if (channelData) {
          socket.join(channelId);
          callback({ data: { channel: channelData } });
        }
      } catch (error) {
        console.error("Error joining channel room:", error);
      }
    },
  };
} 

async function getUserChannels(userId: string, specificChannelId?: string) {
  // Fetch user's channels with flattened structure
  const userChannels = await prisma.userChannel.findMany({
    where: {
      userId: userId,
      ...(specificChannelId && { channelId: specificChannelId }) // Add channel filter if specificChannelId is provided
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
      const [message, unreadCount] = await Promise.all([
        prisma.message.findFirst({
          where: { channelId: channel.id },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.message.count({
          where: {
            channelId: channel.id,
            id: {
              gt: uc.clientOffsetId ?? 0
            }
          }
        })
      ]);

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