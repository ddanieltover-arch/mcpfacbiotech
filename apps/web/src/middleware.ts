import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ──────────────────────────────────────────────────────────────────────────────
// MCPFAC BIOTECH — Next.js Middleware (Volume 3)
// Refreshes Supabase auth sessions on every request and enforces route
// protection for authenticated/unauthenticated users.
// ──────────────────────────────────────────────────────────────────────────────

/** Routes that require authentication. Checkout is public (guest checkout supported). */
const PROTECTED_ROUTES = ['/account', '/orders', '/quotes', '/invoices', '/admin'];

/** Routes that should redirect authenticated users away. */
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

const CANONICAL_HOST = 'www.mcpfacbiotech.site';

function redirectApexToWww(request: NextRequest): NextResponse | null {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  if (host !== 'mcpfacbiotech.site') return null;

  const url = request.nextUrl.clone();
  url.protocol = 'https:';
  url.host = CANONICAL_HOST;
  return NextResponse.redirect(url, 308);
}

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session — this is critical for keeping the session alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Route Protection ────────────────────────────────────────────────────
  // Redirect unauthenticated users away from protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages (login, register, etc.)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && user) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}

export async function middleware(request: NextRequest) {
  const apexRedirect = redirectApexToWww(request);
  if (apexRedirect) return apexRedirect;

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match page routes only. `/api` uses Bearer auth in Nest and must not
     * run through cookie session middleware (breaks admin fetches).
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
