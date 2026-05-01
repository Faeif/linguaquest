/**
 * Sliding-window in-memory rate limiter.
 *
 * Works well for single-instance deployments (Vercel Fluid / long-lived functions).
 * For multi-region / high-traffic production, swap the store for Upstash Redis:
 *   import { Ratelimit } from '@upstash/ratelimit'
 *   import { Redis } from '@upstash/redis'
 *
 * Usage:
 *   const result = rateLimit('push-subscribe', userId, { limit: 10, windowMs: 60_000 })
 *   if (!result.ok) return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
 */

interface Window {
  count: number
  resetAt: number
}

// Global store — survives across requests in the same function instance
const store = new Map<string, Window>()

// Purge stale keys every 5 minutes to prevent unbounded memory growth
setInterval(
  () => {
    const now = Date.now()
    for (const [key, win] of store) {
      if (win.resetAt < now) store.delete(key)
    }
  },
  5 * 60 * 1000
)

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
}

/**
 * Check and increment the rate limit counter for a given key.
 * @param namespace  - Route / feature name (e.g. "push-subscribe")
 * @param identifier - Per-user unique key (user ID or IP)
 * @param opts       - { limit, windowMs }
 */
export function rateLimit(
  namespace: string,
  identifier: string,
  opts: RateLimitOptions
): RateLimitResult {
  const key = `${namespace}:${identifier}`
  const now = Date.now()

  let win = store.get(key)

  if (!win || win.resetAt <= now) {
    // Start a fresh window
    win = { count: 1, resetAt: now + opts.windowMs }
    store.set(key, win)
    return { ok: true, remaining: opts.limit - 1, resetAt: win.resetAt }
  }

  win.count++
  const remaining = Math.max(0, opts.limit - win.count)
  return { ok: win.count <= opts.limit, remaining, resetAt: win.resetAt }
}
