"use client";

import { useEffect } from "react";
import { bindSocketEvents } from "@/lib/socket-event";
export function SocketProvider({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    const cleanup = bindSocketEvents();
    return cleanup;
  }, [bindSocketEvents]);

  return children;
} 