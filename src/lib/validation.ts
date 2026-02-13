import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { toErrorResponse } from './errors';

/**
 * Parse and validate request body with Zod schema
 */
export async function parseBody<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await req.json();
  return schema.parse(body);
}

/**
 * Validate idempotency key header
 */
export function getIdempotencyKey(req: NextRequest): string | null {
  return req.headers.get('Idempotency-Key');
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Common validation schemas
 */
export const Schemas = {
  // Auth
  login: z.object({
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
    password: z.string().min(6),
  }).refine(data => data.email || data.phone, {
    message: 'Either email or phone is required',
  }),

  register: z.object({
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
    password: z.string().min(6).max(100),
    name: z.string().min(2).max(100).optional(),
  }).refine(data => data.email || data.phone, {
    message: 'Either email or phone is required',
  }),

  // Billing
  createInvoice: z.object({
    planId: z.string().cuid(),
  }),

  // Tickets
  createTicket: z.object({
    subject: z.string().min(3).max(120),
    body: z.string().min(1).max(4000),
  }),

  ticketMessage: z.object({
    body: z.string().min(1).max(4000),
  }),

  // Admin
  updateUserRole: z.object({
    role: z.enum(['USER', 'SUPPORT', 'ADMIN']),
  }),

  blockUser: z.object({
    isBlocked: z.boolean(),
    reason: z.string().max(500).optional(),
  }),

  createPlan: z.object({
    name: z.string().min(2).max(100),
    nameFa: z.string().min(2).max(120),
    description: z.string().max(500).optional(),
    descriptionFa: z.string().max(500).optional(),
    priceUsd: z.number().positive(),
    priceToman: z.number().nonnegative().optional(),
    durationDays: z.number().int().positive(),
    durationLabel: z.string().max(50).optional(),
    trafficGB: z.number().int().positive().nullable().optional(),
    maxDevices: z.number().int().positive().default(1),
    features: z.array(z.string()).optional(),
    featuresFa: z.array(z.string()).optional(),
    isTrial: z.boolean().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().nonnegative().optional(),
  }),

  updatePlan: z.object({
    name: z.string().min(2).max(100).optional(),
    nameFa: z.string().min(2).max(120).optional(),
    description: z.string().max(500).optional(),
    descriptionFa: z.string().max(500).optional(),
    priceUsd: z.number().positive().optional(),
    priceToman: z.number().nonnegative().nullable().optional(),
    durationDays: z.number().int().positive().optional(),
    durationLabel: z.string().max(50).optional(),
    trafficGB: z.number().int().positive().nullable().optional(),
    maxDevices: z.number().int().positive().optional(),
    features: z.array(z.string()).optional(),
    featuresFa: z.array(z.string()).optional(),
    isTrial: z.boolean().optional(),
    sortOrder: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
  }),

  createServer: z.object({
    name: z.string().min(2).max(120),
    location: z.string().min(2).max(120),
    countryCode: z.string().length(2).transform((v) => v.toUpperCase()),
    domain: z.string().min(3).max(255),
    ip: z.string().max(64).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    hiddifyInboundId: z.number().int().nonnegative().optional(),
    status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE']).optional(),
    isActive: z.boolean().optional(),
    maxUsers: z.number().int().positive().optional(),
    currentUsers: z.number().int().nonnegative().optional(),
    loadPercent: z.number().int().min(0).max(100).optional(),
  }),

  updateServer: z.object({
    name: z.string().min(2).max(120).optional(),
    location: z.string().min(2).max(120).optional(),
    countryCode: z.string().length(2).transform((v) => v.toUpperCase()).optional(),
    domain: z.string().min(3).max(255).optional(),
    ip: z.string().max(64).nullable().optional(),
    port: z.number().int().min(1).max(65535).optional(),
    hiddifyInboundId: z.number().int().nonnegative().nullable().optional(),
    status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE']).optional(),
    isActive: z.boolean().optional(),
    maxUsers: z.number().int().positive().optional(),
    currentUsers: z.number().int().nonnegative().optional(),
    loadPercent: z.number().int().min(0).max(100).optional(),
  }),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
} as const;

/**
 * Extract pagination params from URL search params
 */
export function getPaginationParams(req: NextRequest): { page: number; limit: number } {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
  };
}

/**
 * API response helper
 */
export function apiResponse<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * API error response helper
 */
export function apiError(err: unknown): NextResponse {
  const { status, body } = toErrorResponse(err);
  return NextResponse.json(body, { status });
}
