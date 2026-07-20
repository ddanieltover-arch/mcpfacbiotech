import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
