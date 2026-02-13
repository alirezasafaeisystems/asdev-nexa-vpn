import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, parseBody } from '@/lib/validation';
import { requireRole } from '@/lib/auth';
import { Schemas } from '@/lib/validation';
import { Errors } from '@/lib/errors';

/**
 * GET /api/v1/admin/plans/[id]
 * Get plan details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireRole('ADMIN');

    const plan = await db.plan.findUnique({
      where: { id },
      include: {
        subscriptions: { take: 10, orderBy: { createdAt: 'desc' } },
        invoices: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!plan) {
      throw Errors.planNotFound();
    }

    return apiResponse({ plan });
  } catch (err) {
    return apiError(err);
  }
}

/**
 * PATCH /api/v1/admin/plans/[id]
 * Update plan
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: admin } = await requireRole('ADMIN');
    const { id } = await params;

    const plan = await db.plan.findUnique({ where: { id } });
    if (!plan) {
      throw Errors.planNotFound();
    }

    const input = await parseBody(req, Schemas.updatePlan);

    const updates: Record<string, unknown> = {};
    if (input.name) updates.name = input.name;
    if (input.nameFa) updates.nameFa = input.nameFa;
    if (input.description !== undefined) updates.description = input.description;
    if (input.descriptionFa !== undefined) updates.descriptionFa = input.descriptionFa;
    if (input.priceUsd) updates.priceUsd = input.priceUsd;
    if (input.priceToman !== undefined) updates.priceToman = input.priceToman;
    if (input.durationDays) updates.durationDays = input.durationDays;
    if (input.durationLabel !== undefined) updates.durationLabel = input.durationLabel;
    if (input.trafficGB !== undefined) updates.trafficGB = input.trafficGB;
    if (input.maxDevices) updates.maxDevices = input.maxDevices;
    if (input.features) updates.features = JSON.stringify(input.features);
    if (input.featuresFa) updates.featuresFa = JSON.stringify(input.featuresFa);
    if (input.isTrial !== undefined) updates.isTrial = input.isTrial;
    if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) updates.isActive = input.isActive;

    if (Object.keys(updates).length === 0) {
      throw Errors.invalidInput('No valid updates provided');
    }

    const updated = await db.plan.update({
      where: { id },
      data: updates,
    });

    // Log admin action
    await db.adminActionLog.create({
      data: {
        actorUserId: admin.id,
        action: 'UPDATE_PLAN',
        targetType: 'Plan',
        targetId: id,
        metaJson: JSON.stringify(updates),
      },
    });

    return apiResponse({ plan: updated });
  } catch (err) {
    return apiError(err);
  }
}

/**
 * DELETE /api/v1/admin/plans/[id]
 * Soft delete (deactivate) plan
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: admin } = await requireRole('ADMIN');
    const { id } = await params;

    const plan = await db.plan.findUnique({ where: { id } });
    if (!plan) {
      throw Errors.planNotFound();
    }

    // Soft delete
    const updated = await db.plan.update({
      where: { id },
      data: { isActive: false },
    });

    // Log admin action
    await db.adminActionLog.create({
      data: {
        actorUserId: admin.id,
        action: 'DELETE_PLAN',
        targetType: 'Plan',
        targetId: id,
      },
    });

    return apiResponse({ success: true, plan: updated });
  } catch (err) {
    return apiError(err);
  }
}
