import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, parseBody } from '@/lib/validation';
import { requireRole } from '@/lib/auth';
import { Schemas } from '@/lib/validation';

/**
 * GET /api/v1/admin/plans
 * List all plans (including inactive)
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole('ADMIN');

    const plans = await db.plan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { subscriptions: true, invoices: true } },
      },
    });

    return apiResponse({ plans });
  } catch (err) {
    return apiError(err);
  }
}

/**
 * POST /api/v1/admin/plans
 * Create a new plan
 */
export async function POST(req: NextRequest) {
  try {
    const { user: admin } = await requireRole('ADMIN');
    const input = await parseBody(req, Schemas.createPlan);

    const plan = await db.plan.create({
      data: {
        name: input.name,
        nameFa: input.nameFa,
        description: input.description,
        descriptionFa: input.descriptionFa,
        priceUsd: input.priceUsd,
        priceToman: input.priceToman,
        durationDays: input.durationDays,
        durationLabel: input.durationLabel,
        trafficGB: input.trafficGB,
        maxDevices: input.maxDevices,
        features: input.features ? JSON.stringify(input.features) : null,
        featuresFa: input.featuresFa ? JSON.stringify(input.featuresFa) : null,
        isTrial: input.isTrial ?? false,
        isActive: input.isActive ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });

    await db.adminActionLog.create({
      data: {
        actorUserId: admin.id,
        action: 'CREATE_PLAN',
        targetType: 'Plan',
        targetId: plan.id,
      },
    });

    return apiResponse({ plan }, 201);
  } catch (err) {
    return apiError(err);
  }
}
