"use client";

import { io } from "socket.io-client";

export const socket = io({
  autoConnect: true,
});

// Debug: log all events
socket.onAny((...args) => {
  console.log("incoming", args);
});

socket.onAnyOutgoing((...args) => {
  console.log("outgoing", args);
});

export default socket;
