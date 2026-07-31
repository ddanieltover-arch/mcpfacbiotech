/**
 * Resolve the Nest/API origin.
 *
 * Browser: always same-origin `/api/v1` on the storefront so requests hit the
 * Next.js bridge (which proxies to Nest). This avoids apex/www CORS splits and
 * stale NEXT_PUBLIC_BACKEND_URL values that caused admin "Failed to fetch".
 *
 * Server/SSR: never fetch this Next deployment (self-fetch deadlocks / empty catalog).
 * Talk to Nest directly — local :3001 or the API host while embed is still settling.
 */
export function getBackendOrigin(): string {
  if (typeof window !== 'undefined') {
    // Ignore NEXT_PUBLIC_BACKEND_URL in the browser except as a documented escape
    // hatch when it points at a real non-localhost host AND the page is local.
    const explicit = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
    if (
      explicit &&
      !/localhost|127\.0\.0\.1/i.test(explicit) &&
      /localhost|127\.0\.0\.1/i.test(window.location.hostname)
    ) {
      return explicit.replace(/\/+$/, '');
    }
    // Same-origin — do not rewrite apex→www here; middleware already canonicalizes
    // document navigations, and same-origin avoids CORS on admin Bearer fetches.
    return window.location.origin;
  }

  // Server-side (RSC / route handlers calling catalog helpers).
  const server =
    process.env.NEST_FALLBACK_URL?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
    (process.env.VERCEL === '1' ? 'https://api.mcpfacbiotech.site' : 'http://localhost:3001');

  const cleaned = server.replace(/\/+$/, '');

  // Guard: storefront URL must not be used as the SSR API origin.
  try {
    const host = new URL(cleaned).hostname.toLowerCase();
    if (host === 'mcpfacbiotech.site' || host === 'www.mcpfacbiotech.site') {
      return 'https://api.mcpfacbiotech.site';
    }
  } catch {
    // keep cleaned
  }

  return cleaned;
}
