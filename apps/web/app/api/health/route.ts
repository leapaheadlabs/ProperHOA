import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async () => {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  // Redis check (if configured)
  try {
    if (process.env.REDIS_URL) {
      const Redis = (await import("ioredis")).default;
      const redis = new Redis(process.env.REDIS_URL);
      await redis.ping();
      redis.disconnect();
      checks.redis = true;
    } else {
      checks.redis = true; // not configured, skip
    }
  } catch {
    checks.redis = false;
  }

  const healthy = checks.database && checks.redis;

  return NextResponse.json(
    { status: healthy ? "healthy" : "unhealthy", checks },
    { status: healthy ? 200 : 503 }
  );
};
