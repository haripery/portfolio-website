import { headers } from "next/headers";
import { createHash } from "crypto";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Identifier prefix to namespace different limiters */
  prefix: string;
}

// Global singleton store (survives across requests in the same serverless instance)
const globalForRateLimit = globalThis as unknown as {
  rateLimitStore: Map<string, RateLimitEntry> | undefined;
};

const store =
  globalForRateLimit.rateLimitStore ?? new Map<string, RateLimitEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.rateLimitStore = store;
}

// Periodic cleanup of expired entries (at most once per 60s)
let lastCleanup = 0;
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Check rate limit for the current request.
 * Returns { success: true } if allowed, or { success: false, retryAfterMs } if blocked.
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<{ success: true } | { success: false; retryAfterMs: number }> {
  cleanup();

  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  const key = `${config.prefix}:${ipHash}`;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { success: true };
  }

  if (entry.count >= config.max) {
    return { success: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { success: true };
}

/** 20 uploads per 15 minutes */
export const uploadRateLimit: RateLimitConfig = {
  max: 20,
  windowMs: 15 * 60 * 1000,
  prefix: "upload",
};

/** 10 AI parsing requests per 15 minutes (shared across document + resume) */
export const aiRateLimit: RateLimitConfig = {
  max: 10,
  windowMs: 15 * 60 * 1000,
  prefix: "ai",
};
