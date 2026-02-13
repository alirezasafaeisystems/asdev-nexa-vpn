import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, parseBody, getPaginationParams } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { Schemas } from '@/lib/validation';
import { Errors } from '@/lib/errors';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit';
import { enqueueNotifySupport } from '@/lib/queues';

/**
 * GET /api/v1/tickets
 * List user's tickets (or all tickets for admin/support)
 */
export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth();
    const { page, limit } = getPaginationParams(req);

    const where = user.role === 'USER' 
      ? { userId: user.id } 
      : {}; // Support/Admin can see all

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        include: { 
          user: { select: { id: true, email: true, phone: true } },
          messages: { 
            orderBy: { createdAt: 'desc' }, 
            take: 1 
          } 
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.ticket.count({ where }),
    ]);

    return apiResponse({
      tickets,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return apiError(err);
  }
}

/**
 * POST /api/v1/tickets
 * Create a new ticket
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth();
    
    // Rate limiting
    const rateResult = checkRateLimit(req, rateLimiters.ticketCreate);
    if (!rateResult.allowed) {
      throw Errors.rateLimited(Math.ceil((rateResult.resetAt - Date.now()) / 1000));
    }

    const input = await parseBody(req, Schemas.createTicket);

    // Create ticket with first message
    const ticket = await db.ticket.create({
      data: {
        userId: user?.id,
        subject: input.subject,
        source: 'WEB',
        status: 'OPEN',
        messages: {
          create: {
            authorRole: 'USER',
            body: input.body,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    // Notify support team via Telegram
    await enqueueNotifySupport({
      ticketId: ticket.id,
      kind: 'NEW_TICKET',
    });

    return apiResponse({ ticket }, 201);
  } catch (err) {
    return apiError(err);
  }
}
