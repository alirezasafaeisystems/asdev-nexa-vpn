import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { Errors } from '@/lib/errors';

/**
 * GET /api/v1/tickets/[id]
 * Get ticket details with messages
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, phone: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw Errors.ticketNotFound();
    }

    // Check ownership (unless admin/support)
    if (user.role === 'USER' && ticket.userId !== user.id) {
      throw Errors.forbidden();
    }

    return apiResponse({ ticket });
  } catch (err) {
    return apiError(err);
  }
}

/**
 * PATCH /api/v1/tickets/[id]
 * Update ticket status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const ticket = await db.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw Errors.ticketNotFound();
    }

    // Only support/admin can change status
    if (user.role === 'USER') {
      throw Errors.forbidden();
    }

    const body = await req.json();
    const { status } = body as { status?: 'OPEN' | 'PENDING_USER' | 'PENDING_SUPPORT' | 'CLOSED' };

    if (status) {
      await db.ticket.update({
        where: { id },
        data: { status, updatedAt: new Date() },
      });
    }

    return apiResponse({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
