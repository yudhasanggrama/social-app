import server from "./app";
import { connectRedis } from "./lib/redis";

const PORT = process.env.PORT;

async function bootstrap() {
  // connect redis sekali saat start
  try {
    await connectRedis();
  } catch (e) {
    console.error("Redis failed to connect (API tetap jalan):", e);
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server is live on port ${PORT}`);
  });
}

bootstrap();
