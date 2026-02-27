// server.ts
import server from "./app";
import { connectRedis } from "./lib/redis";

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("PORT is not defined");
}

async function bootstrap() {
  try {
    await connectRedis();
    console.log("✅ Redis connected");
  } catch (e) {
    console.error("Redis failed to connect:", e);
  }

  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`API   : https://social-app-production-75eb.up.railway.app/api/v1`);
  });
}

bootstrap();
