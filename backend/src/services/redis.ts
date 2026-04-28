import { Redis } from "@upstash/redis";
import type { CanvasState } from "../types.js";

const SESSION_TTL = 60 * 60 * 2;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    : null;

const memory = new Map<string, CanvasState>();
const rates = new Map<string, { count: number; resetAt: number }>();

export async function getSession(sessionId: string): Promise<CanvasState | null> {
  if (!redis) return memory.get(sessionId) ?? null;
  return redis.get<CanvasState>(`session:${sessionId}`);
}

export async function setSession(sessionId: string, state: CanvasState) {
  if (!redis) {
    memory.set(sessionId, state);
    return;
  }
  await redis.set(`session:${sessionId}`, state, { ex: SESSION_TTL });
}

export async function checkRateLimit(userId: string) {
  const key = `rate:${userId}`;
  if (!redis) {
    const now = Date.now();
    const current = rates.get(key) ?? { count: 0, resetAt: now + 60 * 60 * 1000 };
    if (current.resetAt < now) rates.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    else rates.set(key, { ...current, count: current.count + 1 });
    return (rates.get(key)?.count ?? 0) <= 60;
  }
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60 * 60);
  return count <= 60;
}
