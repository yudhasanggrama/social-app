import { io } from "socket.io-client";

export const socket = io("http://localhost:9000", {
  withCredentials: true,
});

socket.on("connect_error", (err) => {
  console.log("❌ socket connect_error:", err?.message);
});

export function connectSocket() {
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}
