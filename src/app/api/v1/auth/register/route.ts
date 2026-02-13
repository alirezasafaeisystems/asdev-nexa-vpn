import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Schemas, parseBody, apiResponse, apiError } from '@/lib/validation';
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth';
import { Errors } from '@/lib/errors';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateResult = checkRateLimit(req, rateLimiters.register);
    if (!rateResult.allowed) {
      throw Errors.rateLimited(Math.ceil((rateResult.resetAt - Date.now()) / 1000));
    }

    const input = await parseBody(req, Schemas.register);

    // Check if user already exists
    if (input.email) {
      const existing = await db.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw Errors.invalidInput('Email already registered');
      }
    }

    if (input.phone) {
      const existing = await db.user.findUnique({ where: { phone: input.phone } });
      if (existing) {
        throw Errors.invalidInput('Phone already registered');
      }
    }

    // Create user
    const passwordHash = await hashPassword(input.password);
    const user = await db.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: 'USER',
      },
    });

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
    }, 201);
  } catch (err) {
    return apiError(err);
  }
}
