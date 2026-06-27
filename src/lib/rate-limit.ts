/**
 * In-memory sliding-window rate limiter. V1 implementation; the interface is
 * Redis-swappable later (the spec requires future-Redis compatibility) without
 * changing call sites.
 */
type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

// Named policies used across the app.
export const RATE_LIMITS = {
  LEAD: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 / IP / hour (hard requirement)
  AUTH: { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 / 15 min
  MEDIA_UPLOAD: { limit: 30, windowMs: 60 * 60 * 1000 },
  ADMIN_WRITE: { limit: 120, windowMs: 60 * 1000 },
} as const;

// Periodically evict expired buckets to bound memory.
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [k, b] of store) if (b.resetAt < now) store.delete(k);
    },
    10 * 60 * 1000,
  ).unref?.();
}
