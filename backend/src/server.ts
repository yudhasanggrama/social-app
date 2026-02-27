// server.ts
import server from "./app";
import { connectRedis } from "./lib/redis";

const PORT = process.env.PORT || 3000; 

async function bootstrap() {
  try {
    await connectRedis();
    console.log("✅ Redis connected");
  } catch (e) {
    console.error("Redis failed to connect:", e);
  }

  // TAMBAHKAN "0.0.0.0" di sini agar bisa diakses secara publik
  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`API   : https://social-app-production-3828.up.railway.app/api/v1`);
  });
}

bootstrap();