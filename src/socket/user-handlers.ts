import { Socket, Server } from "socket.io";
import { prisma } from "@/lib/prisma";

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
        socket.emit('users', users);
        socket.broadcast.emit("user", user);
        
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
          socket.broadcast.emit("user", user);
        }
        console.log(`User disconnected: ${socket.userId}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  };
} 