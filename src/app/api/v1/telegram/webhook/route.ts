import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/validation';
import { enqueueNotifySupport } from '@/lib/queues';
import { z } from 'zod';
import { TELEGRAM } from '@/lib/constants';

// Telegram update schema
const UpdateSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    chat: z.object({ id: z.number() }),
    text: z.string().optional(),
    reply_to_message: z.object({
      message_id: z.number(),
      text: z.string().optional(),
    }).optional(),
    from: z.object({
      id: z.number(),
      username: z.string().optional(),
    }).optional(),
  }).optional(),
});

/**
 * POST /api/v1/telegram/webhook
 * Handle incoming Telegram updates
 */
export async function POST(req: NextRequest) {
  try {
    // Validate secret token
    const secret = req.headers.get('x-telegram-bot-api-secret-token');
    if (secret !== TELEGRAM.WEBHOOK_SECRET) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid telegram secret' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const update = UpdateSchema.parse(body);
    const msg = update.message;

    // No message or no text - just acknowledge
    if (!msg?.text) {
      return NextResponse.json({ ok: true });
    }

    const text = msg.text.trim();

    // Try to extract ticket ID from message
    const ticketIdMatch = text.match(/TicketID:\s*([a-zA-Z0-9_-]+)/i);
    const ticketId = ticketIdMatch?.[1];

    if (ticketId) {
      // This is a reply to a ticket
      const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
      
      if (ticket) {
        // Clean the message (remove TicketID prefix)
        const cleanBody = text.replace(/TicketID:\s*[a-zA-Z0-9_-]+\s*/i, '').trim();
        
        if (cleanBody) {
          // Store the message
          await db.ticketMessage.create({
            data: {
              ticketId: ticket.id,
              authorRole: 'SUPPORT',
              body: cleanBody,
              telegramMessageId: String(msg.message_id),
            },
          });

          // Update ticket status
          await db.ticket.update({
            where: { id: ticket.id },
            data: {
              status: 'PENDING_USER',
              lastMessageAt: new Date(),
              updatedAt: new Date(),
              telegramMessageId: String(msg.message_id),
            },
          });

          console.log(`[telegram] Reply to ticket ${ticketId} stored`);
        }
      } else {
        console.log(`[telegram] Ticket ${ticketId} not found`);
      }
    } else {
      // This might be a command or direct message
      // Handle /start command for Telegram linking (post-MVP)
      if (text.startsWith('/start')) {
        // TODO: Implement Telegram account linking
        console.log('[telegram] Received /start command');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[telegram] Webhook error:', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/telegram/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    configured: !!(TELEGRAM.BOT_TOKEN && TELEGRAM.WEBHOOK_SECRET),
  });
}
