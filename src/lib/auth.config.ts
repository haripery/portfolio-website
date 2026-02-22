import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth configuration.
 * Does NOT import bcryptjs or Prisma — safe to use in middleware.ts (Edge Runtime).
 * The full auth.ts extends this config with the Credentials provider.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isAdminRoute = pathname.startsWith("/admin");
      const isLoginPage = pathname === "/admin/login";

      if (isAdminRoute && !isLoginPage && !isLoggedIn) {
        return false;
      }
      return true;
    },
  },
};
