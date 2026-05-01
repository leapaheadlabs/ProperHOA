import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

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
  president: ["/dashboard", "/violations", "/meetings", "/documents", "/finances", "/settings", "/directory"],
  treasurer: ["/dashboard", "/finances", "/documents", "/meetings", "/settings"],
  secretary: ["/dashboard", "/meetings", "/documents", "/settings"],
  board_member: ["/dashboard", "/violations", "/meetings", "/documents", "/settings"],
  homeowner: ["/portal", "/documents", "/chat"],
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as string | undefined;
  const isPublic = PUBLIC_PATHS.some((p) => nextUrl.pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  // Allow onboarding
  if (nextUrl.pathname.startsWith("/auth/onboarding")) return NextResponse.next();

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

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
