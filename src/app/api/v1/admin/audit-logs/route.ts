import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, getPaginationParams } from '@/lib/validation';
import { requireRole } from '@/lib/auth';

/**
 * GET /api/v1/admin/audit-logs
 * List admin action logs
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole('ADMIN');

    const { page, limit } = getPaginationParams(req);
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const targetType = searchParams.get('targetType');
    const actorUserId = searchParams.get('actorUserId');

    const where = {
      ...(action && { action }),
      ...(targetType && { targetType }),
      ...(actorUserId && { actorUserId }),
    };

    const [logs, total] = await Promise.all([
      db.adminActionLog.findMany({
        where,
        include: {
          actorUser: { select: { id: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.adminActionLog.count({ where }),
    ]);

    return apiResponse({
      logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return apiError(err);
  }
}
