import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { Errors } from '@/lib/errors';

/**
 * GET /api/v1/configs/[id]
 * Get a single VPN config
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const config = await db.userConfig.findUnique({
      where: { id },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            location: true,
            countryCode: true,
            status: true,
          },
        },
      },
    });

    if (!config) {
      throw Errors.invalidInput('Config not found');
    }

    if (user.role === 'USER' && config.userId !== user.id) {
      throw Errors.forbidden();
    }

    const now = new Date();
    const expiresAt = new Date(config.expiresAt);

    return apiResponse({
      config,
      status: {
        isExpired: expiresAt <= now,
        remainingDays: Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
