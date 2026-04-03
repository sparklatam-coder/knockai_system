/**
 * In-memory sliding-window rate limiter.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
 *
 *   export async function POST(request: Request) {
 *     const limited = limiter.check(request);
 *     if (limited) return limited;
 *     // ...
 *   }
 */

interface RateLimitOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests per window */
  max: number;
}

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Cleanup expired entries every 60s to prevent memory leak
let cleanupScheduled = false;

function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000).unref();
}

function getClientIp(request: Request): string {
  const headers = request.headers;
  // Vercel / reverse proxy
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function createRateLimiter(opts: RateLimitOptions) {
  scheduleCleanup();

  return {
    /** Returns a 429 Response if rate limited, or null if allowed. */
    check(request: Request, keySuffix?: string): Response | null {
      const ip = getClientIp(request);
      const key = `${ip}:${keySuffix ?? "default"}`;
      const now = Date.now();

      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + opts.windowMs });
        return null;
      }

      entry.count++;

      if (entry.count > opts.max) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return new Response(
          JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(retryAfter),
            },
          },
        );
      }

      return null;
    },
  };
}
