import { ZodError } from 'zod';
import { HTTP_STATUS, ERROR_CODES } from './constants';

/**
 * Custom HTTP Error class with code and optional details
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Pre-defined error factories for common cases
 */
export const Errors = {
  // Auth errors
  invalidCredentials: () => new HttpError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.INVALID_CREDENTIALS,
    'Invalid email/phone or password'
  ),
  
  sessionExpired: () => new HttpError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.SESSION_EXPIRED,
    'Session has expired. Please log in again.'
  ),
  
  unauthorized: () => new HttpError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.UNAUTHORIZED,
    'Authentication required'
  ),
  
  forbidden: (action?: string) => new HttpError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_CODES.FORBIDDEN,
    action ? `You don't have permission to ${action}` : 'Access denied'
  ),
  
  // Validation errors
  validationError: (details: unknown) => new HttpError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.VALIDATION_ERROR,
    'Invalid input',
    details
  ),
  
  invalidInput: (message: string) => new HttpError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.INVALID_INPUT,
    message
  ),
  
  // Billing errors
  invoiceNotFound: () => new HttpError(
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.INVOICE_NOT_FOUND,
    'Invoice not found'
  ),
  
  invoiceExpired: () => new HttpError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.INVOICE_EXPIRED,
    'Invoice has expired'
  ),
  
  invoiceAlreadyPaid: () => new HttpError(
    HTTP_STATUS.CONFLICT,
    ERROR_CODES.INVOICE_ALREADY_PAID,
    'Invoice has already been paid'
  ),
  
  paymentNotDetected: () => new HttpError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.PAYMENT_NOT_DETECTED,
    'Payment not yet detected'
  ),
  
  planNotFound: () => new HttpError(
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.PLAN_NOT_FOUND,
    'Plan not found'
  ),
  
  // Ticket errors
  ticketNotFound: () => new HttpError(
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.TICKET_NOT_FOUND,
    'Ticket not found'
  ),
  
  ticketClosed: () => new HttpError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.TICKET_CLOSED,
    'Ticket is closed and cannot accept new messages'
  ),
  
  // Rate limiting
  rateLimited: (retryAfter?: number) => new HttpError(
    HTTP_STATUS.TOO_MANY_REQUESTS,
    ERROR_CODES.RATE_LIMITED,
    'Too many requests. Please try again later.',
    retryAfter ? { retryAfter } : undefined
  ),
  
  // System errors
  internalError: (message = 'Something went wrong') => new HttpError(
    HTTP_STATUS.INTERNAL_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    message
  ),
  
  idempotencyConflict: () => new HttpError(
    HTTP_STATUS.CONFLICT,
    ERROR_CODES.IDEMPOTENCY_CONFLICT,
    'A conflicting request is already in progress'
  ),
} as const;

/**
 * Convert any error to a standardized HTTP response
 */
export function toErrorResponse(err: unknown): { status: number; body: Record<string, unknown> } {
  if (err instanceof HttpError) {
    return {
      status: err.status,
      body: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
  }
  
  if (err instanceof ZodError) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      body: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Invalid input',
        details: err.flatten(),
      },
    };
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', err);
  
  return {
    status: HTTP_STATUS.INTERNAL_ERROR,
    body: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Something went wrong',
    },
  };
}

/**
 * Async handler wrapper that catches errors
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<T | { error: { status: number; body: Record<string, unknown> } }> {
  return handler().catch((err) => {
    const { status, body } = toErrorResponse(err);
    return { error: { status, body } };
  });
}
