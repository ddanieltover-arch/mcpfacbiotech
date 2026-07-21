const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

/**
 * Sync the authenticated Supabase user to the NestJS backend profile tables.
 * Safe to call repeatedly — the backend upserts profile and customer records.
 */
export async function syncProfileWithBackend(accessToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      (errorBody as { message?: string } | null)?.message ??
      'Failed to sync profile with backend';
    throw new Error(message);
  }
}
