import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, getPaginationParams } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/v1/configs
 * List user's VPN configs
 */
export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth();

    const configs = await db.userConfig.findMany({
      where: { userId: user.id },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            location: true,
            countryCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse({ configs });
  } catch (err) {
    return apiError(err);
  }
}
