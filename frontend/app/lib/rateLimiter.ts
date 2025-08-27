// In-memory token bucket rate limiter keyed by client IP
// NOTE: Works for single-instance Node runtime. For distributed, use Redis.
const buckets: Map<string, {tokens: number; updated: number}> = new Map();

function getIP(req: Request): string {
  // x-forwarded-for may include a list
  const fwd = req.headers.get('x-forwarded-for') || '';
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

export function ensureRateLimit(req: Request, maxPerMinute = Number(process.env.RATE_LIMIT_PER_MINUTE || 30)) {
  const ip = getIP(req);
  const now = Date.now();
  const minute = 60_000;
  const refillRate = maxPerMinute; // tokens per minute
  const bucket = buckets.get(ip) || { tokens: maxPerMinute, updated: now };

  // Refill
  const elapsed = now - bucket.updated;
  const refill = (elapsed / minute) * refillRate;
  bucket.tokens = Math.min(maxPerMinute, bucket.tokens + refill);
  bucket.updated = now;

  if (bucket.tokens < 1) {
    buckets.set(ip, bucket);
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
  bucket.tokens -= 1;
  buckets.set(ip, bucket);
}
