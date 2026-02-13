import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, parseBody } from '@/lib/validation';
import { requireRole } from '@/lib/auth';
import { Schemas } from '@/lib/validation';
import { Errors } from '@/lib/errors';

/**
 * GET /api/v1/admin/servers/[id]
 * Get server details (admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('ADMIN');
    const { id } = await params;

    const server = await db.vPNServer.findUnique({
      where: { id },
      include: {
        _count: { select: { configs: true, subscriptions: true } },
      },
    });

    if (!server) {
      throw Errors.invalidInput('Server not found');
    }

    return apiResponse({ server });
  } catch (err) {
    return apiError(err);
  }
}

/**
 * PATCH /api/v1/admin/servers/[id]
 * Update server details (admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: admin } = await requireRole('ADMIN');
    const { id } = await params;
    const input = await parseBody(req, Schemas.updateServer);

    const exists = await db.vPNServer.findUnique({ where: { id } });
    if (!exists) {
      throw Errors.invalidInput('Server not found');
    }

    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.location !== undefined) updates.location = input.location;
    if (input.countryCode !== undefined) updates.countryCode = input.countryCode;
    if (input.domain !== undefined) updates.domain = input.domain;
    if (input.ip !== undefined) updates.ip = input.ip;
    if (input.port !== undefined) updates.port = input.port;
    if (input.hiddifyInboundId !== undefined) updates.hiddifyInboundId = input.hiddifyInboundId;
    if (input.status !== undefined) updates.status = input.status;
    if (input.isActive !== undefined) updates.isActive = input.isActive;
    if (input.maxUsers !== undefined) updates.maxUsers = input.maxUsers;
    if (input.currentUsers !== undefined) updates.currentUsers = input.currentUsers;
    if (input.loadPercent !== undefined) updates.loadPercent = input.loadPercent;

    if (Object.keys(updates).length === 0) {
      throw Errors.invalidInput('No valid updates provided');
    }

    const server = await db.vPNServer.update({
      where: { id },
      data: updates,
    });

    await db.adminActionLog.create({
      data: {
        actorUserId: admin.id,
        action: 'UPDATE_SERVER',
        targetType: 'VPNServer',
        targetId: id,
        metaJson: JSON.stringify(updates),
      },
    });

    return apiResponse({ server });
  } catch (err) {
    return apiError(err);
  }
}
