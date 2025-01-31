import { create } from "zustand";
import { produce, enableMapSet } from "immer";
import { User } from "@prisma/client";
import socket from "@/lib/socket-client";
import { CHANNEL_GET_USER_IDS } from "@/config/constants";

enableMapSet();

interface UserStore {
  users: Map<string, User>;
  onlineCount: number;
  setOnlineCount: (count: number) => void;
  updateOnlineCount: (channelId: string) => void;
  addUser: (user: User) => void;
  setUsers: (users: User[]) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: new Map(),
  onlineCount: 0,
  setOnlineCount: (count) => set({ onlineCount: count }),
  updateOnlineCount: (channelId) => {
    socket.emit(CHANNEL_GET_USER_IDS, channelId, ({ data: userIds }: { data: string[] }) => {
      const onlineUsers = userIds.filter(id => {
        const user = get().users.get(id);
        return user?.isOnline;
      }).length;
      set({ onlineCount: onlineUsers });
    });
  },
  addUser: (user) => set(produce((state) => {
    state.users.set(user.id, user);
  })),
  setUsers: (users) => set(produce((state) => {
    state.users = new Map(users.map(user => [user.id, user]));
  })),
})); 