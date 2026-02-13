import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, parseBody, getPaginationParams } from '@/lib/validation';
import { requireAuth } from '@/lib/auth';
import { Schemas } from '@/lib/validation';
import { Errors } from '@/lib/errors';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit';
import { INVOICE_EXPIRY_MINUTES, RATE_LOCK_MINUTES, CRYPTO } from '@/lib/constants';

/**
 * GET /api/v1/invoices
 * List user's invoices
 */
export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth();
    const { page, limit } = getPaginationParams(req);

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where: { userId: user.id },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.invoice.count({ where: { userId: user.id } }),
    ]);

    return apiResponse({
      invoices,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return apiError(err);
  }
}

/**
 * POST /api/v1/invoices
 * Create a new invoice
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth();
    
    // Rate limiting
    const rateResult = checkRateLimit(req, rateLimiters.invoiceCreate);
    if (!rateResult.allowed) {
      throw Errors.rateLimited(Math.ceil((rateResult.resetAt - Date.now()) / 1000));
    }

    const input = await parseBody(req, Schemas.createInvoice);

    // Get plan
    const plan = await db.plan.findUnique({ where: { id: input.planId } });
    if (!plan || !plan.isActive) {
      throw Errors.planNotFound();
    }

    // Calculate amount
    const amountUsd = plan.priceUsd;
    const amountAsset = amountUsd; // USDT is 1:1

    // Calculate expiry
    const now = new Date();
    const rateLockedUntil = new Date(now.getTime() + RATE_LOCK_MINUTES * 60 * 1000);

    // Create invoice
    const invoice = await db.invoice.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'PENDING',
        amountUsd,
        asset: 'USDT',
        network: 'TRC20',
        amountAsset,
        address: CRYPTO.USDT_ADDRESS || 'TJxPlaceholderAddress',
        rateLockedUntil,
      },
      include: { plan: true },
    });

    return apiResponse({
      invoice,
      paymentInstructions: {
        asset: invoice.asset,
        network: invoice.network,
        amount: invoice.amountAsset,
        address: invoice.address,
        expiresIn: INVOICE_EXPIRY_MINUTES * 60,
      },
    }, 201);
  } catch (err) {
    return apiError(err);
  }
}
