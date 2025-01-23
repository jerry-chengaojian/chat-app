import { Server as SocketServer, Socket } from "socket.io";
import { Server as HttpServer } from "node:http";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { ChannelType } from "@prisma/client";
declare module "socket.io" {
  interface Socket {
    username: string;
    userId: string;
  }
}

export class SocketService {
  private io: SocketServer;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer);
    this.init();
  }

  private init() {
    this.io.use((socket: Socket, next) => {
      socket.onAny((...args) => {
        console.log("incoming", args);
      });

      socket.onAnyOutgoing((...args) => {
        console.log("outgoing", args);
      });
      return this.authMiddleware(socket, next);
    });
    this.io.on("connection", (socket) => this.handleConnection(socket));
  }

  private async authMiddleware(socket: Socket, next: (err?: Error) => void) {
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
  }
  
  private async getUserChannels(userId: string) {
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
      },
      take: 10
    });

    // Transform and process channels
    return Promise.all(
      userChannels.map(async (uc) => {
        const channel = uc.channel;
        
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
            name: otherUser?.user.username || 'Unknown User'
          };
        }

        return channel;
      })
    );
  }

  private async handleConnection(socket: Socket) {
    try {
      const flattenedChannels = await this.getUserChannels(socket.userId);
      socket.emit('channels', flattenedChannels);

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
      });
    } catch (error) {
      console.error('Error handling connection:', error);
      socket.disconnect();
    }
  }
}
