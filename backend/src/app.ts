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
import { verifyToken } from "./utils/jwt";

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
    console.log("🍪 rawCookie =", rawCookie);

    if (!rawCookie) {
      return next(new Error("unauthorized: no cookie"));
    }

    const parsed = cookie.parse(rawCookie);
    const rawToken = parsed.token;

    if (!rawToken) {
      return next(new Error("unauthorized: no token"));
    }

    const token = rawToken.startsWith("Bearer ")
      ? rawToken.slice(7)
      : rawToken;

    const payload = verifyToken(token);
    (socket as any).user = payload;

    next();
  } catch (e: any) {
    console.log("❌ VERIFY ERROR =", e.name, e.message);
    next(new Error("unauthorized: invalid token"));
  }
});


io.on("connection", (socket) => {
  const userId = (socket as any).userId as number;

  socket.join(`user:${userId}`);

  console.log(`🟢 socket ${socket.id} connected userId=${userId} (joined user:${userId})`);

  socket.on("disconnect", (reason) => {
    console.log(`🔴 socket disconnected: ${socket.id} reason=${reason}`);
  });
});

server.listen(process.env.PORT, () => {
  console.log("server is running");
});
