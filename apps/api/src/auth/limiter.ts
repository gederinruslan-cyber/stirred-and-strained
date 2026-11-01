// In-process fixed-window rate limits (ADR 0005): per api instance, keys kept in memory only.

/** Returns `take(key)`: counts one attempt, false once the window's limit is used up. */
export function rateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const windows = new Map<string, { start: number; count: number }>();
  return function take(key: string): boolean {
    const t = now();
    if (windows.size > 10_000) {
      for (const [k, w] of windows) if (t - w.start >= windowMs) windows.delete(k);
    }
    const w = windows.get(key);
    if (!w || t - w.start >= windowMs) {
      windows.set(key, { start: t, count: 1 });
      return true;
    }
    w.count += 1;
    return w.count <= limit;
  };
}
