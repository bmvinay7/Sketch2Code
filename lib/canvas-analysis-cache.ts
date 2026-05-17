import { redis } from "@/lib/redis";

type CacheValue = string | null;

const globalForCanvasCache = globalThis as typeof globalThis & {
  sketchCodeCanvasCache?: Map<string, { value: string; expiresAt: number }>;
};

const memoryCache = globalForCanvasCache.sketchCodeCanvasCache ?? new Map<string, { value: string; expiresAt: number }>();
if (!globalForCanvasCache.sketchCodeCanvasCache) {
  globalForCanvasCache.sketchCodeCanvasCache = memoryCache;
}

export interface CanvasAnalysisSession {
  sessionId: string;
  language: string;
  problemContext?: string;
  imageBase64?: string;
  snapshot?: unknown;
}

function key(name: string) {
  return `canvas:${name}`;
}

export async function getCanvasCache(name: string): Promise<CacheValue> {
  const cacheKey = key(name);
  if (redis) {
    const value = await redis.get<string>(cacheKey);
    return value ?? null;
  }

  const entry = memoryCache.get(cacheKey);
  if (!entry || entry.expiresAt < Date.now()) {
    memoryCache.delete(cacheKey);
    return null;
  }
  return entry.value;
}

export async function setCanvasCache(name: string, value: string, ttlSeconds: number) {
  const cacheKey = key(name);
  if (redis) {
    await redis.set(cacheKey, value, { ex: ttlSeconds });
    return;
  }

  memoryCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}

export async function deleteCanvasCache(name: string) {
  const cacheKey = key(name);
  if (redis) {
    await redis.del(cacheKey);
    return;
  }
  memoryCache.delete(cacheKey);
}

export async function setAnalysisSession(session: CanvasAnalysisSession) {
  await setCanvasCache(`session:${session.sessionId}`, JSON.stringify(session), 60 * 5);
}

export async function getAnalysisSession(sessionId: string) {
  const value = await getCanvasCache(`session:${sessionId}`);
  if (!value) return null;

  try {
    return JSON.parse(value) as CanvasAnalysisSession;
  } catch {
    return null;
  }
}

export async function incrementRateLimit(bucket: string, limit: number, ttlSeconds: number) {
  if (redis) {
    const count = await redis.incr(key(`rate:${bucket}`));
    if (count === 1) await redis.expire(key(`rate:${bucket}`), ttlSeconds);
    return count <= limit;
  }

  const cacheKey = key(`rate:${bucket}`);
  const current = memoryCache.get(cacheKey);
  const now = Date.now();
  const count = current && current.expiresAt > now ? Number(current.value) + 1 : 1;
  memoryCache.set(cacheKey, { value: String(count), expiresAt: now + ttlSeconds * 1000 });
  return count <= limit;
}

export function summarizeCanvasSnapshot(snapshot: unknown) {
  const record = snapshot && typeof snapshot === "object" ? snapshot as Record<string, unknown> : {};
  const elements = Array.isArray(record.sceneElements) ? record.sceneElements : [];

  return elements.slice(0, 40).map((element) => {
    const entry = element && typeof element === "object" ? element as Record<string, unknown> : {};
    return {
      type: entry.type,
      text: typeof entry.text === "string" ? entry.text.slice(0, 120) : undefined,
      x: Math.round(Number(entry.x ?? 0)),
      y: Math.round(Number(entry.y ?? 0))
    };
  });
}

export function cleanGeneratedCode(value: string) {
  return value
    .replace(/```(?:python|java|cpp|c\+\+|javascript|typescript|go|rust|ruby|php|kotlin|swift|csharp|c#|scala|dart|c)?\n/gi, "")
    .replace(/```/g, "");
}
