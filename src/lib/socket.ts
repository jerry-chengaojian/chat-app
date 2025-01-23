"use client";

import { io } from "socket.io-client";
import { useChatStore } from "@/store/chat-store";

export const socket = io({
  autoConnect: false,
});

// Debug: log all events
socket.onAny((...args) => {
  console.log("incoming", args);
});

socket.onAnyOutgoing((...args) => {
  console.log("outgoing", args);
});

socket.on("message", (message) => {
  useChatStore.getState().addMessage(message);
});

socket.on("messages", (messages) => {
  useChatStore.getState().setMessages(messages);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

export default socket;
