import { createClient } from "redis"

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined
}

if (!globalForRedis.redis) {
  globalForRedis.redis = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  })
  globalForRedis.redis.on("error", (err) => console.error("Redis client error:", err))
  globalForRedis.redis.connect().catch((err) => console.error("Redis connect error:", err))
}

export const redis = globalForRedis.redis
