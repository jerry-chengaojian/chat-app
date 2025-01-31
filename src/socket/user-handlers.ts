import { Socket, Server } from "socket.io";
import { prisma } from "../lib/prisma";
import { USER_LIST, USER_UPDATE } from "../config/constants";

export function createUserHandlers(socket: Socket, io: Server) {
  return {
    handleInitialUsers: async () => {
      try {
        // Update user's online status
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

        // Get all users
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
        socket.emit(USER_LIST, users);
        socket.broadcast.emit(USER_UPDATE, user);
        
        // Join user's own room
        socket.join(socket.userId);
        return user;
      } catch (error) {
        console.error('Error handling initial users:', error);
        return null;
      }
    },

    handleDisconnect: async () => {
      try {
        const matchingSockets = await io.in(socket.userId).fetchSockets();
        const isDisconnected = matchingSockets.length === 0;

        if (isDisconnected) {
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
          socket.broadcast.emit(USER_UPDATE, user);
        }
        console.log(`User disconnected: ${socket.userId}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  };
} 