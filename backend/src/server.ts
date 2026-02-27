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
    console.log(`API   : http://localhost:${PORT}/api/v1`);
    console.log(`DOCS  : http://localhost:${PORT}/docs`);
  });
}

bootstrap();
