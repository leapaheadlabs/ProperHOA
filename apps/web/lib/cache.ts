import Redis from "ioredis";

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

const DEFAULT_TTL = 300; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function setCache(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> {
  if (!redis) return;
  await redis.setex(key, ttl, JSON.stringify(value));
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export function cacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(":")}`;
}
