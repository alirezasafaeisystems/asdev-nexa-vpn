import { cookies } from 'next/headers';
import { db } from './db';
import { SESSION_COOKIE_NAME, SESSION_TTL_DAYS } from './constants';
import { Errors } from './errors';
import type { User, Session } from '@prisma/client';

type SessionWithUser = Session & { user: User };

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: 'USER' | 'SUPPORT' | 'ADMIN';
  isBlocked: boolean;
}

export interface AuthResult {
  user: AuthUser;
  session: SessionWithUser;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}

/**
 * Create a new session for user
 */
export async function createSession(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<Session> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  return db.session.create({
    data: {
      userId,
      expiresAt,
      ip,
      userAgent,
    },
  });
}

/**
 * Get current session from cookie
 */
export async function getSession(): Promise<SessionWithUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) return null;

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await db.session.delete({ where: { id: sessionId } });
    return null;
  }

  return session;
}

/**
 * Get current authenticated user or throw
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getSession();
  
  if (!session) {
    throw Errors.unauthorized();
  }

  const user = session.user;
  
  if (user.isBlocked) {
    throw Errors.forbidden('access this account');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role as 'USER' | 'SUPPORT' | 'ADMIN',
      isBlocked: user.isBlocked,
    },
    session,
  };
}

/**
 * Require specific role
 */
export async function requireRole(
  ...roles: ('USER' | 'SUPPORT' | 'ADMIN')[]
): Promise<AuthResult> {
  const auth = await requireAuth();
  
  if (!roles.includes(auth.user.role)) {
    throw Errors.forbidden();
  }

  return auth;
}

/**
 * Set session cookie
 */
export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Logout - delete session and clear cookie
 */
export async function logout(): Promise<void> {
  const session = await getSession();
  
  if (session) {
    await db.session.delete({ where: { id: session.id } });
  }
  
  await clearSessionCookie();
}

/**
 * Get optional user (doesn't throw if not authenticated)
 */
export async function getOptionalUser(): Promise<AuthUser | null> {
  try {
    const session = await getSession();
    if (!session?.user) return null;
    
    const user = session.user;
    if (user.isBlocked) return null;
    
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role as 'USER' | 'SUPPORT' | 'ADMIN',
      isBlocked: user.isBlocked,
    };
  } catch {
    return null;
  }
}
