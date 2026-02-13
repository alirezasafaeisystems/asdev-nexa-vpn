import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Schemas, parseBody, apiResponse, apiError } from '@/lib/validation';
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth';
import { Errors } from '@/lib/errors';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/v1/auth/login
 * Login with email/phone and password
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateResult = checkRateLimit(req, rateLimiters.login);
    if (!rateResult.allowed) {
      throw Errors.rateLimited(Math.ceil((rateResult.resetAt - Date.now()) / 1000));
    }

    const input = await parseBody(req, Schemas.login);

    // Find user by email or phone
    let user;
    if (input.email) {
      user = await db.user.findUnique({ where: { email: input.email } });
    } else if (input.phone) {
      user = await db.user.findUnique({ where: { phone: input.phone } });
    }

    if (!user || !user.passwordHash) {
      throw Errors.invalidCredentials();
    }

    // Check if blocked
    if (user.isBlocked) {
      throw Errors.forbidden('access this account');
    }

    // Verify password
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw Errors.invalidCredentials();
    }

    // Create session
    const session = await createSession(user.id);
    await setSessionCookie(session.id);

    return apiResponse({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      session: { id: session.id },
    });
  } catch (err) {
    return apiError(err);
  }
}
