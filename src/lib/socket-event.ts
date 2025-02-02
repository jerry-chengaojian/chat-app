import socket from "@/lib/socket-client";
import { ChatChannel, useChannelStore } from "../stores/channel-store";
import { useMessageStore } from "../stores/message-store";
import { useUserStore } from "../stores/user-store";
import { CHANNEL_ADDED, CHANNEL_LIST, CHANNEL_MARK_READ, MESSAGE_NEW, USER_LIST, USER_UPDATE } from "@/config/constants";

export const bindSocketEvents = () => {
  // Debug logging
  socket.onAny((...args) => {
    console.log("incoming", args);
  });

  socket.onAnyOutgoing((...args) => {
    console.log("outgoing", args);
  });

  // Message events
  socket.on(MESSAGE_NEW, (message) => {
    if (message.channelId === useChannelStore.getState().selectedChannelId) {
      useMessageStore.getState().addMessage(message);
      socket.emit(CHANNEL_MARK_READ, message.channelId);
    }
    useChannelStore.getState().incrementUnreadCount(message.channelId);
    useChannelStore.getState().updateLatestMessage(
      message.channelId,
      message.content,
      message.createdAt
    );
  });

  // Channel events
  socket.on(CHANNEL_LIST, (channels) => {
    useChannelStore.getState().setChannels(channels);
  });

  // User events
  socket.on(USER_LIST, (users) => {
    useUserStore.getState().setUsers(users);
    const selectedChannelId = useChannelStore.getState().selectedChannelId;
    if (selectedChannelId) {
      useUserStore.getState().updateOnlineCount(selectedChannelId);
    }
  });

  socket.on(USER_UPDATE, (user) => {
    useUserStore.getState().addUser(user);
    const selectedChannelId = useChannelStore.getState().selectedChannelId;
    if (selectedChannelId) {
      useUserStore.getState().updateOnlineCount(selectedChannelId);
    }
  });

  socket.on(CHANNEL_ADDED, (channel: ChatChannel) => {
    // 使用防抖来确保只处理一次相同的channel
    const existingChannel = useChannelStore.getState().channels.find(c => c.id === channel.id);
    if (!existingChannel) {
      useChannelStore.getState().addChannel(channel);
    }
  });

  // Error handling
  socket.on("error", (error: Error) => {
    console.error("Socket error:", error);
  });

  socket.connect();

  return () => {
    socket.offAny();
    socket.offAnyOutgoing();
    socket.off(MESSAGE_NEW);
    socket.off(CHANNEL_LIST);
    socket.off('error');
    socket.off(USER_UPDATE);
    socket.off(USER_LIST);
    socket.off(CHANNEL_ADDED);
    socket.disconnect();
  };
}; 