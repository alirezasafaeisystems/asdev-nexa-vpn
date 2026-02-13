import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/validation';

/**
 * GET /api/v1/plans
 * List all active plans
 */
export async function GET(req: NextRequest) {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return apiResponse({ plans });
  } catch (err) {
    return apiError(err);
  }
}
