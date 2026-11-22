"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const rawUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                   (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000");
    socket = io(rawUrl, { 
      transports: ["websocket", "polling"],
      autoConnect: true 
    });
  }
  return socket;
}
