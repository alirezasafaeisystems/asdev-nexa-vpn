import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, getPaginationParams } from '@/lib/validation';
import { requireRole } from '@/lib/auth';

/**
 * GET /api/v1/admin/users
 * List all users (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole('ADMIN', 'SUPPORT');

    const { page, limit } = getPaginationParams(req);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const isBlocked = searchParams.get('isBlocked');

    const where = {
      ...(role && { role: role as 'USER' | 'SUPPORT' | 'ADMIN' }),
      ...(isBlocked !== null && { isBlocked: isBlocked === 'true' }),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          isBlocked: true,
          createdAt: true,
          _count: {
            select: { subscriptions: true, invoices: true, tickets: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return apiResponse({
      users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return apiError(err);
  }
}
