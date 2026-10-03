/**
 * In-memory sliding-window limiter. Good for a single Node process.
 * On serverless, pass your own `RateLimiter` (KV, Redis, Durable Objects…).
 */
export interface RateLimiter { hit(key: string): boolean | Promise<boolean> }

export function memoryRateLimiter(o: { windowMs: number; max: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    hit(key) {
      const now = Date.now();
      const list = (hits.get(key) ?? []).filter((t) => t > now - o.windowMs);
      if (list.length >= o.max) { hits.set(key, list); return false; }
      list.push(now);
      hits.set(key, list);
      if (hits.size > 10_000) for (const [k, v] of hits) if (!v.some((t) => t > now - o.windowMs)) hits.delete(k);
      return true;
    },
  };
}
