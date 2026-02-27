import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";

import router from "./routes/index";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import { connectRedis } from "./lib/redis";

const app = express();

/** 1. Buat HTTP Server dulu */
const server = http.createServer(app);

/** 2. Konfigurasi CORS Express */
const allowedOrigin = "https://social-app-eta-azure.vercel.app";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/** 3. Inisialisasi Socket.IO (Cukup SATU kali deklarasi) */
export const io = new Server(server, {
  cors: {
    origin: allowedOrigin, // Gunakan URL Vercel
    credentials: true,
  },
  transports: ["websocket"],
});

// static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

/** API Routes */
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { withCredentials: true },
}));
app.use("/api/v1", router);

/** Socket Logic */
io.use((socket, next) => {
  try {
    const raw = socket.request.headers.cookie;
    if (!raw) return next(new Error("No cookie"));

    const parsed = cookie.parse(raw);
    const token = parsed.token;
    if (!token) return next(new Error("Unauthorized"));

    const secret = process.env.JWT_SECRET;
    if (!secret) return next(new Error("JWT_SECRET not set"));

    const payload = jwt.verify(token, secret);
    (socket.data as any).user = payload;

    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.join("feed");
  const u = (socket.data as any).user;
  const myIdRaw = u?.id ?? u?.userId ?? u?.sub ?? 0;
  const myId = Number(myIdRaw);

  if (Number.isFinite(myId) && myId > 0) {
    socket.join(`user:${myId}`);
    console.log("✅ joined room:", `user:${myId}`);
  }

  socket.on("ping", () => socket.emit("pong"));
});

export default server;