"use client";

import { io, Socket } from "socket.io-client";

export const socket: Socket = io({ autoConnect: false });

// Debug: log all events
socket.onAny((...args) => {
  console.log("incoming", args);
});

socket.onAnyOutgoing((...args) => {
  console.log("outgoing", args);
});

export default socket;
