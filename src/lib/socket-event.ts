import socket from "@/lib/socket-client";
import { useChannelStore } from "../stores/channel-store";
import { useMessageStore } from "../stores/message-store";
import { useUserStore } from "../stores/user-store";

export const bindSocketEvents = () => {
  // Debug logging
  socket.onAny((...args) => {
    console.log("incoming", args);
  });

  socket.onAnyOutgoing((...args) => {
    console.log("outgoing", args);
  });

  // Message events
  socket.on("message", (message) => {
    useMessageStore.getState().addMessage(message);
    useChannelStore.getState().incrementUnreadCount(message.channelId);
    useChannelStore.getState().updateLatestMessage(
      message.channelId,
      message.content,
      message.createdAt
    );
  });

  // Channel events
  socket.on('channels', (channels) => {
    useChannelStore.getState().setChannels(channels);
  });

  // User events
  socket.on("users", (users) => {
    useUserStore.getState().setUsers(users);
    const selectedChannelId = useChannelStore.getState().selectedChannelId;
    if (selectedChannelId) {
      useUserStore.getState().updateOnlineCount(selectedChannelId);
    }
  });

  socket.on("user", (user) => {
    useUserStore.getState().addUser(user);
    const selectedChannelId = useChannelStore.getState().selectedChannelId;
    if (selectedChannelId) {
      useUserStore.getState().updateOnlineCount(selectedChannelId);
    }
  });

  // Error handling
  socket.on("error", (error: Error) => {
    console.error("Socket error:", error);
  });

  socket.connect();

  return () => {
    socket.off('message');
    socket.off('channels');
    socket.off('error');
    socket.off('user');
    socket.off('users');
    socket.disconnect();
  };
}; 