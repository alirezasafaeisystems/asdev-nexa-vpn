import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/v1/servers
 * List all active VPN servers
 */
export async function GET(req: NextRequest) {
  try {
    const servers = await db.vPNServer.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        location: true,
        countryCode: true,
        status: true,
        loadPercent: true,
      },
      orderBy: { location: 'asc' },
    });

    return apiResponse({ servers });
  } catch (err) {
    return apiError(err);
  }
}
