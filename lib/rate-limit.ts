type Entry = { count: number; resetAt: number };

const bucket = new Map<string, Entry>();

function getWindowMs() {
  const raw = process.env.RATE_LIMIT_WINDOW_MS;
  const parsed = raw ? Number(raw) : 60_000;
  return Number.isFinite(parsed) ? parsed : 60_000;
}

function getMax() {
  const raw = process.env.RATE_LIMIT_MAX;
  const parsed = raw ? Number(raw) : 120;
  return Number.isFinite(parsed) ? parsed : 120;
}

export function rateLimit(identifier: string) {
  const now = Date.now();
  const windowMs = getWindowMs();
  const max = getMax();
  const entry = bucket.get(identifier);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;
    bucket.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  bucket.set(identifier, entry);
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}
