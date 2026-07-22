/**
 * Motion policy for MCPFAC BIOTECH storefront.
 *
 * Marketing / catalog — Level 1–2 motion (reveals, page fades, badge pop).
 * Ops surfaces (admin, checkout, dense portals) — hover/focus only.
 * Entrance, stagger, and press-scale motion slows scanning of tables and forms.
 */

export const MOTION_REDUCE_ATTR = 'data-motion' as const;
export const MOTION_REDUCE_VALUE = 'reduce' as const;

/** Props to spread on ops layout roots (admin, checkout, account portals). */
export const motionReduceProps = {
  [MOTION_REDUCE_ATTR]: MOTION_REDUCE_VALUE,
} as const;

/** Exact marketing / catalog paths that receive soft page fades. */
export const MARKETING_TRANSITION_EXACT = new Set([
  '/',
  '/about',
  '/blog',
  '/calculator',
  '/careers',
  '/cart',
  '/coa',
  '/compare',
  '/contact',
  '/cookies',
  '/downloads',
  '/faq',
  '/privacy',
  '/products',
  '/quality',
  '/research',
  '/returns',
  '/shipping',
  '/solutions',
  '/support',
  '/terms',
  '/wishlist',
]);

export const MARKETING_TRANSITION_PREFIXES = [
  '/blog/',
  '/products/',
  '/research/',
  '/solutions/',
] as const;

export function isMarketingTransitionPath(pathname: string): boolean {
  if (MARKETING_TRANSITION_EXACT.has(pathname)) return true;
  return MARKETING_TRANSITION_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Admin, checkout, and customer portal — no route fades or decorative motion. */
export function isOpsPath(pathname: string): boolean {
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/checkout' ||
    pathname.startsWith('/checkout/') ||
    pathname === '/account' ||
    pathname.startsWith('/account/') ||
    pathname === '/orders' ||
    pathname.startsWith('/orders/') ||
    pathname === '/quotes' ||
    pathname.startsWith('/quotes/') ||
    pathname === '/invoices' ||
    pathname.startsWith('/invoices/')
  );
}
