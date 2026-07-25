/**
 * Resolve the Nest/API origin.
 *
 * Unified deploy (option 2): leave NEXT_PUBLIC_BACKEND_URL unset so the browser
 * talks same-origin (`/api/v1/...` on mcpfacbiotech.site).
 *
 * Override with NEXT_PUBLIC_BACKEND_URL only when pointing at a separate API.
 */
export function getBackendOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }

  // Browser: always same-origin.
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Local turbo SSR: call Nest directly (avoid Next → Next self-proxy).
  if (process.env.VERCEL !== '1' && process.env.NEST_EMBEDDED !== '1') {
    return (process.env.BACKEND_URL || 'http://localhost:3001').replace(/\/+$/, '');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_URL?.trim();
  if (appUrl) {
    return appUrl.replace(/\/+$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
  }

  return 'http://localhost:3000';
}
