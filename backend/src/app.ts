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

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "https://social-app-nu-pearl.vercel.app/";

/** ========= Middlewares ========= */
app.use(
  cors({
    origin: allowedOrigin,
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
    origin: allowedOrigin,
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
  // ✅ join room feed
  socket.join("feed");

  // ✅ AUTO JOIN room user:<id> (supaya io.to(`user:${id}`).emit nyampe)
  const u = (socket.data as any).user;

  // coba ambil id dari beberapa kemungkinan field
  const myIdRaw = (u as any)?.id ?? (u as any)?.userId ?? (u as any)?.sub ?? 0;
  const myId = Number(myIdRaw);

  if (Number.isFinite(myId) && myId > 0) {
    socket.join(`user:${myId}`);
    console.log("✅ joined room:", `user:${myId}`, "socket:", socket.id);
  } else {
    console.log("⚠️ socket connected but user id missing in JWT payload:", u);
  }

  // ✅ OPTIONAL: allow explicit join from client (berguna kalau mau)
  socket.on("user:join", ({ userId }) => {
    const uid = Number(userId);
    if (!Number.isFinite(uid) || uid <= 0) return;
    socket.join(`user:${uid}`);
    console.log("✅ user:join:", `user:${uid}`, "socket:", socket.id);
  });

  socket.on("user:leave", ({ userId }) => {
    const uid = Number(userId);
    if (!Number.isFinite(uid) || uid <= 0) return;
    socket.leave(`user:${uid}`);
    console.log("✅ user:leave:", `user:${uid}`, "socket:", socket.id);
  });

  // contoh event
  socket.on("ping", () => {
    socket.emit("pong");
  });
});

export default server;
