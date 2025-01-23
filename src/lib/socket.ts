"use client";

import { io } from "socket.io-client";
import { ChatChannel, useChatStore } from "@/store/chat-store";

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
  useChatStore.getState().incrementUnreadCount(message.channelId);
  const channelId = useChatStore.getState().selectedChannelId;
  channelId && socket.emit("mark_channel_read", channelId);
  // Move the message's channel to the top of the list
  const channels = useChatStore.getState().channels;
  const channelIndex = channels.findIndex(c => c.id === message.channelId);
  if (channelIndex > 0) {
    const updatedChannels = [
      channels[channelIndex],
      ...channels.slice(0, channelIndex),
      ...channels.slice(channelIndex + 1)
    ];
    useChatStore.getState().setChannels(updatedChannels);
  }
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
socket.on('channels', (receivedChannels: ChatChannel[]) => {
  useChatStore.getState().setChannels(receivedChannels);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

export default socket;
