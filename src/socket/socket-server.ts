import { Server as SocketServer, Socket } from "socket.io";
import { Server as HttpServer } from "node:http";
import { createMessageHandlers } from "./message-handlers";
import { createChannelHandlers } from "./channel-handlers";
import { createUserHandlers } from "./user-handlers";
import {
  CHANNEL_GET_USER_IDS,
  CHANNEL_JOIN,
  CHANNEL_MARK_READ,
  MESSAGE_LOAD_MORE,
  MESSAGE_SEND,
  CHANNEL_CREATE_OR_GET_PRIVATE,
} from "../config/constants";

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
      const { getToken } = await import("next-auth/jwt");
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
      socket.on(MESSAGE_SEND, messageHandlers.handleNewMessage);
      socket.on(MESSAGE_LOAD_MORE, messageHandlers.handleLoadMoreMessages);

      // Register channel event handlers
      socket.on(CHANNEL_JOIN, channelHandlers.handleJoinChannel);
      socket.on(CHANNEL_MARK_READ, channelHandlers.handleMarkChannelRead);
      socket.on(CHANNEL_GET_USER_IDS, channelHandlers.handleGetChannelUserIds);
      socket.on(CHANNEL_CREATE_OR_GET_PRIVATE, channelHandlers.handleCreateOrGetPrivateChannel);

      // Handle disconnect
      socket.on("disconnect", userHandlers.handleDisconnect);
    } catch (error) {
      console.error("Error handling connection:", error);
      socket.disconnect();
    }
  });

  return io;
}
