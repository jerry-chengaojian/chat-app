import { createServer } from "node:http";
import next from "next";
import { SocketService } from "./src/lib/socket-server";

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = "localhost";
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize Socket.IO service
  new SocketService(httpServer);

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Ready on http://${hostname}:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`
      );
    });
});
