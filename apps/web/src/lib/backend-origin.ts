/**
 * Resolve the Nest/API origin.
 *
 * Browser: same-origin `/api/v1` on the storefront (unified deploy).
 * Server/SSR: never fetch this Next deployment (self-fetch deadlocks / empty catalog).
 * Talk to Nest directly — local :3001 or the API host while embed is still settling.
 */
export function getBackendOrigin(): string {
  // Browser: always same-origin so `/api/v1` goes through the Next nest-bridge.
  if (typeof window !== 'undefined') {
    return canonicalizeBrowserOrigin(window.location.origin);
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

/** Apex → www so API calls are not broken by Vercel’s 308 domain redirect. */
function canonicalizeBrowserOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    if (url.hostname.toLowerCase() === 'mcpfacbiotech.site') {
      url.hostname = 'www.mcpfacbiotech.site';
    }
    return url.origin;
  } catch {
    return origin.replace(/\/+$/, '');
  }
}
