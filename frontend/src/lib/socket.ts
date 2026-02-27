import { io, Socket } from "socket.io-client";

// Ambil URL dari environment variable
const SOCKET_URL = "https://social-app-production-75eb.up.railway.app";

export const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false, // 👈 PENTING: Jangan connect otomatis sebelum dipanggil
});

// Listener untuk memantau status (sangat berguna untuk debugging)
socket.on("connect", () => {
  console.log("🚀 Socket connected successfully to:", SOCKET_URL);
});

socket.on("connect_error", (err) => {
  console.log("❌ socket connect_error:", err.message);
  // Log URL untuk memastikan tidak menembak ke domain Vercel
  console.log("Current Socket URL:", SOCKET_URL); 
});

export function connectSocket() {
  // Hanya connect jika belum terhubung
  if (!socket.connected) {
    console.log("Initiating socket connection...");
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    console.log("Disconnecting socket...");
    socket.disconnect();
  }
}