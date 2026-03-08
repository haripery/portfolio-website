import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { type NextRequest, NextResponse } from "next/server";
import { securityHeaders } from "@/lib/security-headers";

const { auth } = NextAuth(authConfig);

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

// Auth-wrapped middleware for regular page requests
const authMiddleware = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isLoginPage = nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !isLoggedIn) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/admin/login", nextUrl))
    );
  }

  if (isLoginPage && isLoggedIn) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
    );
  }

  return applySecurityHeaders(NextResponse.next());
});

export default function middleware(req: NextRequest) {
  // Server action requests (POST with Next-Action header) bypass the NextAuth
  // middleware — the beta auth wrapper can return 405 on Vercel's Edge Runtime.
  // Server actions handle their own auth where needed.
  if (req.headers.get("next-action")) {
    return applySecurityHeaders(NextResponse.next());
  }

  return (authMiddleware as any)(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and API routes except /admin
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
