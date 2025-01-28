import { Server as SocketServer, Socket } from "socket.io";
import { Server as HttpServer } from "node:http";
import { getToken } from "next-auth/jwt";
import { createMessageHandlers } from './message-handlers';
import { createChannelHandlers } from './channel-handlers';
import { createUserHandlers } from './user-handlers';

declare module "socket.io" {
  interface Socket {
    username: string;
    userId: string;
  }
}

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
      // Initialize handlers
      const messageHandlers = createMessageHandlers(socket);
      const channelHandlers = createChannelHandlers(socket);
      const userHandlers = createUserHandlers(socket, io);

      // Join user channels and emit channels data
      await channelHandlers.handleInitialChannels();
      
      // Handle initial user data and status
      await userHandlers.handleInitialUsers();

      // Register message event handlers
      socket.on('message:send', messageHandlers.handleNewMessage);
      socket.on('load_more_messages', messageHandlers.handleLoadMoreMessages);

      // Register channel event handlers
      socket.on('join_channel', channelHandlers.handleJoinChannel);
      socket.on('mark_channel_read', channelHandlers.handleMarkChannelRead);
      socket.on('get_channel_user_ids', channelHandlers.handleGetChannelUserIds);

      // Handle disconnect
      socket.on('disconnect', userHandlers.handleDisconnect);
    } catch (error) {
      console.error('Error handling connection:', error);
      socket.disconnect();
    }
  });

  return io;
}
