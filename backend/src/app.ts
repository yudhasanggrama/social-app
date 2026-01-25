import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";

import router from "./routes/index";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/v1", router);

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
  transports: ["websocket"],
});

io.use((socket, next) => {
  try {
    const rawCookie = socket.request.headers.cookie;
    if (!rawCookie) return next(new Error("No cookie"));

    const parsed = cookie.parse(rawCookie);
    const token = parsed.token; // 🔥 GANTI kalau cookie kamu namanya beda

    if (!token) return next(new Error("Unauthorized"));

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    // simpan userId di socket
    (socket as any).userId = payload.id;

    next();
  } catch (e) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = (socket as any).userId as number | undefined;

  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`🟢 socket ${socket.id} joined user:${userId}`);
  } else {
    console.log(`🟡 socket ${socket.id} connected without userId`);
  }

  socket.on("disconnect", () => {
    console.log("🔴 socket disconnected:", socket.id);
  });

  socket.on("connect_error", (e) => console.log("[client] socket connect_error:", e.message));
});

server.listen(process.env.PORT, () => {
  console.log("server is running");
});
