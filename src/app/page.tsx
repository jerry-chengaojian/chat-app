"use client";

import { socket } from "@/lib/socket";
import { useEffect, useState } from "react";

declare module "socket.io-client" {
  interface Socket {
    userId?: string;
  }
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    function onSession({ userId }: { userId: string }) {
      socket.userId = userId;
    }
    socket.on("session", onSession);
    setIsConnected(true);

    return () => {
      socket.off("session", onSession);
    };
  }, []);
  return <>{isConnected ? "Connected" : "Disconnected"}</>;
}
