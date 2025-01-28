import { Server as SocketServer, Socket } from "socket.io";
import { Server as HttpServer } from "node:http";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { ChannelType } from "@prisma/client";
import { createMessageHandlers } from './message-handlers';
import { createChannelHandlers } from './channel-handlers';

declare module "socket.io" {
  interface Socket {
    username: string;
    userId: string;
  }
}

const MESSAGES_LIMIT = 5;

export function initializeSocketServer(httpServer: HttpServer) {
  const io = new SocketServer(httpServer);

  // Auth middleware
  io.use(async (socket: Socket, next) => {
    socket.onAny((...args) => {
      console.log("incoming", args);
    });

    socket.onAnyOutgoing((...args) => {
      console.log("outgoing", args);
    });

    try {
      const headers = Object.fromEntries(
        Object.entries(socket.request.headers).map(([key, value]) => [
          key,
          String(value),
        ])
      );
      const token = (await getToken({
        req: { headers },
        secret: process.env.AUTH_SECRET,
      })) as { userId: string; username: string };
      socket.userId = token.userId;
      socket.username = token.username;
      next();
    } catch (error) {
      next(error as Error);
    }
  });

  io.on("connection", async (socket) => {
    try {
      const flattenedChannels = await getUserChannels(socket.userId);
      socket.emit('channels', flattenedChannels);

      // Join all user channels
      for (const channel of flattenedChannels) {
        socket.join(channel.id);
      }

      // Initialize handlers
      const messageHandlers = createMessageHandlers(socket);
      const channelHandlers = createChannelHandlers(socket);

      // Register message event handlers
      socket.on('message:send', messageHandlers.handleNewMessage);
      socket.on('load_more_messages', messageHandlers.handleLoadMoreMessages);

      // Register channel event handlers
      socket.on('join_channel', channelHandlers.handleJoinChannel);
      socket.on('mark_channel_read', channelHandlers.handleMarkChannelRead);
      socket.on('get_channel_user_ids', channelHandlers.handleGetChannelUserIds);

      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true, 
          isOnline: true,
          lastPing: true
        },
        orderBy: {
          username: 'asc'
        }
      });
      socket.emit('users', users);
      socket.join(socket.userId);
      // Update user's online status and last ping time
      const user = await prisma.user.update({
        where: { id: socket.userId },
        data: {
          isOnline: true,
          lastPing: new Date()
        },
        select: {
          id: true,
          username: true,
          isOnline: true,
          lastPing: true,
        }
      });
      io.emit("user", user);

      // Handle disconnect
      socket.on('disconnect', async () => {
        const matchingSockets = await io.in(socket.userId).fetchSockets();
        const isDisconnected = matchingSockets.length === 0;

        if (isDisconnected) {
          // Update user connection status
          const user = await prisma.user.update({
            where: { id: socket.userId },
            data: { isOnline: false },
            select: {
              id: true,
              username: true,
              isOnline: true,
              lastPing: true,
            }
          });
          console.log("user offline", user);
          io.emit("user", user);
        }
        console.log(`User disconnected: ${socket.userId}`);
      });
    } catch (error) {
      console.error('Error handling connection:', error);
      socket.disconnect();
    }
  });

  return io;
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
