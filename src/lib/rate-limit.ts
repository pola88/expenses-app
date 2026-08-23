// In-memory rate limiter: works per-process, adequate for a personal household app.
// For Vercel multi-region deployments, replace with @upstash/ratelimit.
export function createRateLimiter(windowMs: number, maxAttempts: number) {
  const attempts = new Map<string, { count: number; resetAt: number }>()

  return function isRateLimited(key: string): boolean {
    const now = Date.now()
    const entry = attempts.get(key)
    if (!entry || now > entry.resetAt) {
      attempts.set(key, { count: 1, resetAt: now + windowMs })
      return false
    }
    entry.count++
    return entry.count > maxAttempts
  }
}
