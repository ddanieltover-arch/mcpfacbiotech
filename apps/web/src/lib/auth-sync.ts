import type { AuthUser } from '@mcpfac/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

/**
 * Sync the authenticated Supabase user to the NestJS backend profile tables.
 * Safe to call repeatedly — the backend upserts profile and customer records.
 */
export async function syncProfileWithBackend(accessToken: string): Promise<AuthUser | null> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      (errorBody as { message?: string } | null)?.message ??
      'Failed to sync profile with backend';
    throw new Error(message);
  }

  const body = (await response.json()) as { data?: AuthUser };
  return body.data ?? null;
}

export async function fetchAuthMe(accessToken: string): Promise<AuthUser | null> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { data?: AuthUser };
  return body.data ?? null;
}
