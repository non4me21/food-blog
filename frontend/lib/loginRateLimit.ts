import { redis } from "./redis"

const MAX_ATTEMPTS = 5
const WINDOW_SECONDS = 15 * 60

function key(ip: string) {
  return `ratelimit:login:${ip}`
}

export async function checkLoginRateLimit(
  ip: string
): Promise<{ blocked: boolean; retryAfterSeconds?: number }> {
  try {
    const count = await redis.get(key(ip))
    if (count && parseInt(count) >= MAX_ATTEMPTS) {
      const ttl = await redis.ttl(key(ip))
      return { blocked: true, retryAfterSeconds: ttl > 0 ? ttl : WINDOW_SECONDS }
    }
    return { blocked: false }
  } catch {
    return { blocked: false }
  }
}

export async function recordFailedLoginAttempt(ip: string): Promise<void> {
  try {
    const count = await redis.incr(key(ip))
    if (count === 1) await redis.expire(key(ip), WINDOW_SECONDS)
  } catch {
    // ignore — fail open
  }
}

export async function clearLoginRateLimit(ip: string): Promise<void> {
  try {
    await redis.del(key(ip))
  } catch {
    // ignore
  }
}
