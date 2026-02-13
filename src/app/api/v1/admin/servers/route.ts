import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, parseBody } from '@/lib/validation';
import { requireRole } from '@/lib/auth';
import { Schemas } from '@/lib/validation';

/**
 * GET /api/v1/admin/servers
 * List all VPN servers (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole('ADMIN');

    const servers = await db.vPNServer.findMany({
      orderBy: { location: 'asc' },
      include: {
        _count: { select: { configs: true, subscriptions: true } },
      },
    });

    return apiResponse({ servers });
  } catch (err) {
    return apiError(err);
  }
}

/**
 * POST /api/v1/admin/servers
 * Create a new VPN server (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const { user: admin } = await requireRole('ADMIN');
    const input = await parseBody(req, Schemas.createServer);

    const server = await db.vPNServer.create({
      data: {
        name: input.name,
        location: input.location,
        countryCode: input.countryCode,
        domain: input.domain,
        ip: input.ip,
        port: input.port ?? 443,
        hiddifyInboundId: input.hiddifyInboundId,
        status: input.status ?? 'ONLINE',
        isActive: input.isActive ?? true,
        maxUsers: input.maxUsers ?? 500,
        currentUsers: input.currentUsers ?? 0,
        loadPercent: input.loadPercent ?? 0,
      },
    });

    await db.adminActionLog.create({
      data: {
        actorUserId: admin.id,
        action: 'CREATE_SERVER',
        targetType: 'VPNServer',
        targetId: server.id,
      },
    });

    return apiResponse({ server }, 201);
  } catch (err) {
    return apiError(err);
  }
}
