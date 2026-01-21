import "dotenv/config";
import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import router from "./routes/index";


const app = express()
app.use(
  cors({
    origin: "http://localhost:5173", // Vite
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/v1", router)

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);
  socket.on("disconnect", () => console.log("socket disconnected:", socket.id));
  socket.on("connect_error", (e) => console.log("[client] socket connect_error:", e.message));
});



server.listen(process.env.PORT, () => {
  console.log("server is running");
});