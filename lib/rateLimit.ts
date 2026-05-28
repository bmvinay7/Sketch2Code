/**
 * Per-key sliding-hour rate limiter, in-memory.
 *
 * Why in-memory: this is a $0 demo deployment. Upstash would be more correct
 * (limits survive cold starts and shared across Vercel function instances)
 * but adds a dependency. For low traffic on a single Vercel region, a Map
 * is "good enough" — worst case is a determined attacker bypasses the limit
 * by waiting for a cold start, which rate-limits them anyway.
 *
 * Keys are Clerk user IDs (signed-in caller) or falling back to a request
 * fingerprint when called from an unauthenticated context.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = Number(process.env.RATE_LIMIT_PER_HOUR ?? 60);

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    const fresh = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(key, fresh);
    return { allowed: true, remaining: MAX_PER_WINDOW - 1, resetAt: fresh.resetAt };
  }
  existing.count += 1;
  const allowed = existing.count <= MAX_PER_WINDOW;
  return { allowed, remaining: Math.max(0, MAX_PER_WINDOW - existing.count), resetAt: existing.resetAt };
}
