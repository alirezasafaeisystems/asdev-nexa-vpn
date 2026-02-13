import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/validation';

/**
 * GET /api/v1/auth/me
 * Get current authenticated user
 */
export async function GET() {
  try {
    const { user } = await requireAuth();
    
    return apiResponse({ user });
  } catch (err) {
    return apiError(err);
  }
}
