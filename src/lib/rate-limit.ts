import { NextRequest, NextResponse } from 'next/server';
import { Errors, toErrorResponse } from './errors';

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for rate limits
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Rate limiter configuration
 */
interface RateLimitConfig {
  // Maximum requests per window
  limit: number;
  // Window in milliseconds
  windowMs: number;
  // Key generator function
  keyGenerator?: (req: NextRequest) => string;
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(req: NextRequest): string {
  // Try to get real IP from headers (behind proxy)
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return ip;
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = (config.keyGenerator || defaultKeyGenerator)(req);
  const now = Date.now();
  const fullKey = `${key}:${req.nextUrl.pathname}`;

  let entry = rateLimitStore.get(fullKey);

  if (!entry || entry.resetAt < now) {
    // Create new entry
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(fullKey, entry);
    
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: entry.resetAt,
    };
  }

  if (entry.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(fullKey, entry);

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  config: RateLimitConfig
): (handler: (req: NextRequest) => Promise<NextResponse>) => (req: NextRequest) => Promise<NextResponse> {
  return (handler) => async (req: NextRequest) => {
    const result = checkRateLimit(req, config);
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      const response = NextResponse.json(
        {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          details: { retryAfter },
        },
        { status: 429 }
      );
      response.headers.set('Retry-After', String(retryAfter));
      return response;
    }

    return handler(req);
  };
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  // Auth endpoints - strict
  login: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  register: {
    limit: 3,
    windowMs: 60 * 1000,
  },

  // Ticket endpoints - moderate
  ticketCreate: {
    limit: 3,
    windowMs: 60 * 1000,
  },
  ticketMessage: {
    limit: 10,
    windowMs: 60 * 1000,
  },

  // Billing - moderate
  invoiceCreate: {
    limit: 5,
    windowMs: 60 * 1000,
  },

  // Webhooks - loose (trusted source)
  webhook: {
    limit: 100,
    windowMs: 60 * 1000,
  },
} as const;
