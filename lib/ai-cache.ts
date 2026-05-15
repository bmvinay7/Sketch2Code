import { createHash } from "crypto";
import { redis } from "@/lib/redis";

const globalForAiCache = globalThis as typeof globalThis & {
  sketchCodeAiCache?: Map<string, { value: string; expiresAt: number }>;
};

const memoryCache = globalForAiCache.sketchCodeAiCache ?? new Map<string, { value: string; expiresAt: number }>();
if (!globalForAiCache.sketchCodeAiCache) {
  globalForAiCache.sketchCodeAiCache = memoryCache;
}

export function createAiCacheKey(parts: Array<string | undefined | null>) {
  return createHash("sha256")
    .update(parts.filter(Boolean).join("::"))
    .digest("hex");
}

export async function getCachedAiResult(key: string) {
  if (redis) {
    const value = await redis.get<string>(`ai:${key}`);
    return value ?? null;
  }

  const entry = memoryCache.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value;
}

export async function setCachedAiResult(key: string, value: string, ttlSeconds = 60 * 60) {
  if (redis) {
    await redis.set(`ai:${key}`, value, { ex: ttlSeconds });
    return;
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}
