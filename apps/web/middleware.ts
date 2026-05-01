import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import Redis from "ioredis";

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

// Rate limiting configuration
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60; // seconds

async function checkRateLimit(ip: string, path: string): Promise<boolean> {
  if (!redis) return true; // skip if no redis
  const key = `ratelimit:${ip}:${path}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, RATE_WINDOW);
  }
  return current <= RATE_LIMIT;
}

const PUBLIC_PATHS = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/reset-password",
  "/auth/new-password",
  "/auth/verify-email",
  "/auth/error",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

const ROLE_ROUTES: Record<string, string[]> = {
  president: ["/dashboard", "/violations", "/meetings", "/documents", "/finances", "/settings", "/directory", "/compliance", "/maintenance", "/arc"],
  treasurer: ["/dashboard", "/finances", "/documents", "/meetings", "/settings", "/compliance"],
  secretary: ["/dashboard", "/meetings", "/documents", "/settings", "/compliance"],
  board_member: ["/dashboard", "/violations", "/meetings", "/documents", "/settings", "/directory", "/arc"],
  homeowner: ["/portal", "/documents", "/chat", "/maintenance"],
};

export default auth(async (req) => {
  const { nextUrl } = req;
  const response = NextResponse.next();

  // Security headers (always applied)
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "off");

  // HSTS for production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Rate limiting for API routes
  if (nextUrl.pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const allowed = await checkRateLimit(ip, nextUrl.pathname);
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
  }

  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as string | undefined;
  const isPublic = PUBLIC_PATHS.some((p) => nextUrl.pathname.startsWith(p));

  if (isPublic) return response;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  // Allow onboarding
  if (nextUrl.pathname.startsWith("/auth/onboarding")) return response;

  // Role-based access control
  if (userRole) {
    const allowedRoutes = ROLE_ROUTES[userRole] || [];
    const hasAccess = allowedRoutes.some((route) =>
      nextUrl.pathname.startsWith(route)
    );
    if (!hasAccess && nextUrl.pathname !== "/unauthorized") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
