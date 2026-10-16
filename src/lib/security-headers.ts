/**
 * Security headers applied to every response via middleware.
 * This file must be Edge-compatible (no Node.js APIs).
 */

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://platform.twitter.com https://syndication.twitter.com https://cdn.syndication.twimg.com",
  "style-src 'self' 'unsafe-inline' https://platform.twitter.com",
  "img-src 'self' data: blob: https://*.r2.dev https://*.cloudflare.com https://pub-*.r2.dev https://syndication.twitter.com https://pbs.twimg.com https://abs.twimg.com",
  "font-src 'self' data:",
  "connect-src 'self' https://us.posthog.com https://us.i.posthog.com",
  "frame-src 'self' https://platform.twitter.com https://syndication.twitter.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
];

export const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": cspDirectives.join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};
