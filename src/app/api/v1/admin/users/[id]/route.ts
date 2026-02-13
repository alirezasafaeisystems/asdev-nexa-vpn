import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, parseBody } from '@/lib/validation';
import { requireRole } from '@/lib/auth';
import { Schemas } from '@/lib/validation';
import { Errors } from '@/lib/errors';

/**
 * GET /api/v1/admin/users/[id]
 * Get user details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireRole('ADMIN', 'SUPPORT');

    const user = await db.user.findUnique({
      where: { id },
      include: {
        subscriptions: { include: { plan: true }, take: 10, orderBy: { createdAt: 'desc' } },
        invoices: { take: 10, orderBy: { createdAt: 'desc' } },
        tickets: { take: 10, orderBy: { createdAt: 'desc' } },
        telegramLinks: true,
      },
    });

    if (!user) {
      throw Errors.invalidInput('User not found');
    }

    return apiResponse({ user });
  } catch (err) {
    return apiError(err);
  }
}

/**
 * PATCH /api/v1/admin/users/[id]
 * Update user (role, blocked status)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: admin } = await requireRole('ADMIN');
    const { id } = await params;
    const body = await req.json() as { role?: string; isBlocked?: boolean };

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw Errors.invalidInput('User not found');
    }

    // Prevent self-modification of role
    if (id === admin.id && body.role) {
      throw Errors.invalidInput('Cannot change your own role');
    }

    const updates: Record<string, unknown> = {};

    if (body.role && ['USER', 'SUPPORT', 'ADMIN'].includes(body.role)) {
      updates.role = body.role;
    }

    if (typeof body.isBlocked === 'boolean') {
      updates.isBlocked = body.isBlocked;
    }

    if (Object.keys(updates).length === 0) {
      throw Errors.invalidInput('No valid updates provided');
    }

    const updated = await db.user.update({
      where: { id },
      data: updates,
    });

    // Log admin action
    await db.adminActionLog.create({
      data: {
        actorUserId: admin.id,
        action: body.isBlocked !== undefined ? 'BLOCK_USER' : 'UPDATE_USER_ROLE',
        targetType: 'User',
        targetId: id,
        metaJson: JSON.stringify(updates),
      },
    });

    return apiResponse({ user: updated });
  } catch (err) {
    return apiError(err);
  }
}
