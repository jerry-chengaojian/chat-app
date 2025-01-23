"use client";

import { io } from "socket.io-client";
import { useChatStore } from "@/store/chat-store";
import { Channel } from "@prisma/client";

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

socket.on("messages", ({ messages, hasMore }) => {
  useChatStore.getState().setMessages(messages);
  useChatStore.getState().setHasMore(hasMore);
});

socket.on("more_messages", ({ messages, hasMore }) => {
  useChatStore.getState().prependMessages(messages);
  useChatStore.getState().setHasMore(hasMore);
});

// Listen for channels from server
socket.on('channels', (receivedChannels: Channel[]) => {
  useChatStore.getState().setChannels(receivedChannels);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

export default socket;
