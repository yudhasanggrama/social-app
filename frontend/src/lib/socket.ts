import { io } from "socket.io-client";


export const socket = io(import.meta.env.VITE_API_BASE_URL, {
    transports: ["websocket"],
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
