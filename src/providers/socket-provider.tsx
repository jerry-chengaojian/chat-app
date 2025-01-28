"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chat-store";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const bindEvents = useChatStore((state) => state.bindEvents);

  useEffect(() => {
    const cleanup = bindEvents();
    return cleanup;
  }, [bindEvents]);

  return children;
} 