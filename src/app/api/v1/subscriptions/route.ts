import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, getPaginationParams } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/v1/subscriptions
 * List user's subscriptions
 */
export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth();
    const { page, limit } = getPaginationParams(req);

    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where: { userId: user.id },
        include: { 
          plan: true,
          server: {
            select: { id: true, name: true, location: true, countryCode: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.subscription.count({ where: { userId: user.id } }),
    ]);

    return apiResponse({
      subscriptions,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return apiError(err);
  }
}
