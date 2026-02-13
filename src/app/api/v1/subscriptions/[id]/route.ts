import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { Errors } from '@/lib/errors';

/**
 * GET /api/v1/subscriptions/[id]
 * Get subscription details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const subscription = await db.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!subscription) {
      throw Errors.invalidInput('Subscription not found');
    }

    // Check ownership
    if (subscription.userId !== user.id && user.role === 'USER') {
      throw Errors.forbidden();
    }

    // Calculate remaining days
    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    const remainingDays = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return apiResponse({
      subscription,
      status: {
        isActive: subscription.status === 'ACTIVE' && expiresAt > now,
        remainingDays,
        expiresAt,
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
