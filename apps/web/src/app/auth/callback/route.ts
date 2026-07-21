import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

async function syncProfileWithBackend(accessToken: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/v1/auth/sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Auth callback profile sync failed:', response.status, await response.text());
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Auth Callback Route Handler (Volume 3)
// Exchanges the Supabase auth code for a session after email confirmation
// or password reset. Redirects to the `next` query param or `/`.
// ──────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        await syncProfileWithBackend(session.access_token);
      }

      // Successful code exchange — redirect to the intended destination
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // If no code or exchange failed, redirect to an error page
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
