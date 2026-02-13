import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, parseBody, getPaginationParams } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { Schemas } from '@/lib/validation';
import { Errors } from '@/lib/errors';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit';
import { enqueueNotifySupport } from '@/lib/queues';

/**
 * GET /api/v1/tickets/[id]/messages
 * Get ticket messages
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const { page, limit } = getPaginationParams(req);

    const ticket = await db.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw Errors.ticketNotFound();
    }

    // Check ownership
    if (user.role === 'USER' && ticket.userId !== user.id) {
      throw Errors.forbidden();
    }

    const [messages, total] = await Promise.all([
      db.ticketMessage.findMany({
        where: { ticketId: id },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.ticketMessage.count({ where: { ticketId: id } }),
    ]);

    return apiResponse({
      messages,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return apiError(err);
  }
}

/**
 * POST /api/v1/tickets/[id]/messages
 * Add a message to ticket
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    // Rate limiting
    const rateResult = checkRateLimit(req, rateLimiters.ticketMessage);
    if (!rateResult.allowed) {
      throw Errors.rateLimited(Math.ceil((rateResult.resetAt - Date.now()) / 1000));
    }

    const ticket = await db.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw Errors.ticketNotFound();
    }

    if (ticket.status === 'CLOSED') {
      throw Errors.ticketClosed();
    }

    // Check ownership (unless admin/support)
    if (user.role === 'USER' && ticket.userId !== user.id) {
      throw Errors.forbidden();
    }

    const input = await parseBody(req, Schemas.ticketMessage);

    // Create message
    const message = await db.ticketMessage.create({
      data: {
        ticketId: id,
        authorRole: user.role,
        body: input.body,
      },
    });

    // Update ticket
    const newStatus = user.role === 'USER' ? 'PENDING_SUPPORT' : 'PENDING_USER';
    await db.ticket.update({
      where: { id },
      data: {
        status: newStatus,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Notify support if message from user
    if (user.role === 'USER') {
      await enqueueNotifySupport({
        ticketId: id,
        kind: 'NEW_MESSAGE',
      });
    }

    return apiResponse({ message }, 201);
  } catch (err) {
    return apiError(err);
  }
}
