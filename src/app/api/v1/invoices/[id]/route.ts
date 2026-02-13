import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { Errors } from '@/lib/errors';

/**
 * GET /api/v1/invoices/[id]
 * Get invoice details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { plan: true, payments: true },
    });

    if (!invoice) {
      throw Errors.invoiceNotFound();
    }

    // Check ownership
    if (invoice.userId !== user.id && user.role === 'USER') {
      throw Errors.forbidden();
    }

    // Calculate remaining time
    const now = new Date();
    const expiresAt = new Date(invoice.rateLockedUntil);
    const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    return apiResponse({
      invoice,
      paymentStatus: {
        isExpired: invoice.status === 'EXPIRED',
        isPaid: invoice.status === 'PAID',
        remainingSeconds,
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
