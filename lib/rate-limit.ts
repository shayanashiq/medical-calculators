type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type BucketStore = Map<string, RateLimitEntry>;

declare global {
  var __medicalCalculatorsRateLimits: BucketStore | undefined;
}

function getStore(): BucketStore {
  if (!globalThis.__medicalCalculatorsRateLimits) {
    globalThis.__medicalCalculatorsRateLimits = new Map<string, RateLimitEntry>();
  }
  return globalThis.__medicalCalculatorsRateLimits;
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const store = getStore();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { ok: false as const, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  store.set(key, current);
  return { ok: true as const, remaining: limit - current.count, resetAt: current.resetAt };
}
