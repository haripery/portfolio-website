import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { securityHeaders } from "@/lib/security-headers";

const { auth } = NextAuth(authConfig);

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export default auth((req) => {
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

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and API routes except /admin
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
