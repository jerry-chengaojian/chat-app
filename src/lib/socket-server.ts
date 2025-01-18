import { Server as SocketServer, Socket } from "socket.io";
import { Server as HttpServer } from "node:http";
import { prisma } from "./prisma";
import { getToken } from "next-auth/jwt";

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
      // update user connected status
      await prisma.user.update({
        where: { id: token.userId },
        data: { connected: true },
      });
      socket.userId = token.userId;
      socket.username = token.username;
      next();
    } catch (error) {
      next(error as Error);
    }
  }

  private async handleConnection(socket: Socket) {
    // Send session details
    socket.emit("session", {
      userId: socket.userId,
    });
  }
}
