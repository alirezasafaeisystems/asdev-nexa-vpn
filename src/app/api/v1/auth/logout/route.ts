import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/validation';

/**
 * POST /api/v1/auth/logout
 * Logout current user
 */
export async function POST() {
  try {
    await logout();
    return apiResponse({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
