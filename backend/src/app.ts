import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";

// ✅ router utama kamu
import router from "./routes/index";

// ✅ swagger
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

// ✅ redis (node-redis)
import { connectRedis } from "./lib/redis";

const app = express();

/** ========= Middlewares ========= */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// health check (buat cek server hidup)
app.get("/health", (_req, res) => res.json({ ok: true }));

/** ========= Swagger UI =========
 * /docs (bukan /api/v1/docs)
 */
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      withCredentials: true, // penting kalau mau cookie ikut ke request swagger
    },
  })
);

/** ========= API Routes ========= */
app.use("/api/v1", router);

/** ========= HTTP Server + Socket.IO ========= */
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
  transports: ["websocket"],
});

// Socket auth pakai cookie token (mirip punyamu)
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
    // simpan payload supaya bisa dipakai di event handler
    (socket.data as any).user = payload;

    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  // contoh join room feed
  socket.join("feed");

  // contoh event
  socket.on("ping", () => {
    socket.emit("pong");
  });
});

export default app;
