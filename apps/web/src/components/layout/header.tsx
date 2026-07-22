'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Heart,
  Scale,
  FileText,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useCompareStore } from '@/stores/compare.store';
import { fadeInDown } from '@/lib/motion';
import { CountBadge } from '@/components/ui/count-badge';
import { logout } from '@/app/(auth)/actions';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/brand/logo';
import { ProductSearch } from '@/components/products/product-search';
import { isAdminRole } from '@mcpfac/shared-types';
import type { CategoryOption } from '@/lib/catalog-api';
import { HEADER_TOP_LINKS, buildMainNav } from '@/lib/site-navigation';

type HeaderProps = {
  productCategories?: CategoryOption[];
};

export function Header({ productCategories = [] }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartItemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.count());
  const compareCount = useCompareStore((s) => s.count());
  const { user, profile, isLoading: authLoading } = useAuthStore();
  const showAdmin = isAdminRole(profile?.role);
  const [isPending, startTransition] = useTransition();
  const navigation = buildMainNav(productCategories);

  const userDisplayName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ''}`.trim()
    : user?.email?.split('@')[0] ?? '';

  const userInitials = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name?.[0] ?? ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  const handleLogout = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      await logout();
      router.push('/');
      router.refresh();
    });
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setExpandedMobile(null);
  };

  // Close drawer on route change
  useEffect(() => {
    closeMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to pathname
  }, [pathname]);

  // Escape + body scroll lock while drawer is open
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobile();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Utility top bar — outside .glass so brand-deep stays solid/visible */}
        <div className="border-b border-white/10 bg-brand-deep text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs">
            <span className="hidden min-w-0 truncate text-brand-pale sm:inline">
              Global biotechnology research laboratory — Serving 50+ countries
            </span>
            <nav
              aria-label="Quick links"
              className="flex flex-1 flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:flex-none sm:gap-x-4"
            >
              {HEADER_TOP_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 font-medium text-white/95 underline-offset-2 transition-colors hover:text-brand-leaf hover:underline"
                >
                  {link.name}
                </Link>
              ))}
              <a
                href="mailto:info@mcpfacbiotech.site"
                className="hidden shrink-0 text-brand-pale transition-colors hover:text-white xl:inline"
              >
                info@mcpfacbiotech.site
              </a>
            </nav>
          </div>
        </div>

        {/* Main navigation */}
        <div className="glass border-b border-neutral-200/50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
            <Logo size="sm" className="shrink-0" />

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => 'children' in item && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-brand-deep',
                    )}
                  >
                    {item.name}
                    {'children' in item && (
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform',
                          activeDropdown === item.name && 'rotate-180',
                        )}
                      />
                    )}
                  </Link>

                  <AnimatePresence>
                    {'children' in item && activeDropdown === item.name && (
                      <motion.div
                        variants={fadeInDown}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={cn(
                          'absolute left-0 top-full z-50 mt-1 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-neutral-200/80',
                          item.name === 'Solutions' ? 'w-80' : 'w-60',
                        )}
                      >
                        <div className="border-b border-neutral-100 bg-gradient-to-r from-brand-pale/60 to-white px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-natural">
                            {item.name}
                          </p>
                          <Link
                            href={item.href}
                            className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-deep transition-colors hover:text-brand-natural"
                          >
                            View all
                            <ArrowRight className="h-3 w-3" aria-hidden />
                          </Link>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-1.5">
                          {item.children.map((child) => {
                            const description = child.description;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-brand-pale/70"
                              >
                                <span className="block text-sm font-semibold text-brand-deep">
                                  {child.name}
                                </span>
                                {description ? (
                                  <span className="mt-0.5 block text-xs leading-snug text-neutral-500">
                                    {description}
                                  </span>
                                ) : null}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <ProductSearch />

              <Link
                href="/wishlist"
                className="relative hidden rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-deep sm:block"
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart className="h-5 w-5" />
                <CountBadge count={wishlistCount} />
              </Link>

              <Link
                href="/compare"
                className="relative hidden rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-deep sm:block"
                aria-label={`Compare with ${compareCount} items`}
              >
                <Scale className="h-5 w-5" />
                <CountBadge count={compareCount} />
              </Link>

              {!authLoading && user ? (
                <div
                  className="relative hidden sm:block"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                    aria-label="User menu"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-deep text-xs font-bold text-white">
                      {userInitials}
                    </div>
                    <span className="hidden xl:inline">{userDisplayName}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        variants={fadeInDown}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg"
                      >
                        <div className="border-b border-neutral-100 px-3 py-2">
                          <p className="text-sm font-semibold text-neutral-900">{userDisplayName}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/account"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-brand-pale hover:text-brand-deep"
                          >
                            <Settings className="h-4 w-4" />
                            My Account
                          </Link>
                          {showAdmin ? (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-brand-pale hover:text-brand-deep"
                            >
                              <Shield className="h-4 w-4" />
                              Admin Console
                            </Link>
                          ) : null}
                          <Link
                            href="/quotes"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-brand-pale hover:text-brand-deep"
                          >
                            <FileText className="h-4 w-4" />
                            My Quotes
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-brand-pale hover:text-brand-deep"
                          >
                            <Package className="h-4 w-4" />
                            My Orders
                          </Link>
                          <Link
                            href="/invoices"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-brand-pale hover:text-brand-deep"
                          >
                            <FileText className="h-4 w-4" />
                            My Invoices
                          </Link>
                        </div>
                        <div className="border-t border-neutral-100 pt-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isPending}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            <LogOut className="h-4 w-4" />
                            {isPending ? 'Signing out...' : 'Sign Out'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : !authLoading ? (
                <Link
                  href="/login"
                  className="hidden rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-deep sm:block"
                  aria-label="Sign in"
                >
                  <User className="h-5 w-5" />
                </Link>
              ) : null}

              <button
                type="button"
                onClick={() => useCartStore.getState().toggleCart()}
                className="relative rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-deep"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                <CountBadge count={cartItemCount} />
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-drawer"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* Mobile drawer — rendered outside header so fixed positioning works */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation overlay"
              className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />
            <motion.aside
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed inset-y-0 left-0 z-[70] flex w-full max-w-sm flex-col bg-white shadow-xl lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
                <Logo size="sm" href="/" />
                <button
                  type="button"
                  onClick={closeMobile}
                  className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const hasChildren = 'children' in item;
                    const isExpanded = expandedMobile === item.name;

                    if (!hasChildren) {
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-brand-deep"
                          onClick={closeMobile}
                        >
                          {item.name}
                        </Link>
                      );
                    }

                    return (
                      <div key={item.name}>
                        <div className="flex items-center gap-1">
                          <Link
                            href={item.href}
                            className="flex-1 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-brand-deep"
                            onClick={closeMobile}
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-brand-deep"
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.name}`}
                            onClick={() =>
                              setExpandedMobile((current) =>
                                current === item.name ? null : item.name,
                              )
                            }
                          >
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform',
                                isExpanded && 'rotate-180',
                              )}
                            />
                          </button>
                        </div>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mb-1 ml-2 space-y-1 border-l-2 border-brand-leaf/40 pl-2">
                                {item.children.map((child) => {
                                  const description = child.description;
                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      className="block rounded-lg px-3 py-2 transition-colors hover:bg-brand-pale/60"
                                      onClick={closeMobile}
                                    >
                                      <span className="block text-sm font-medium text-brand-deep">
                                        {child.name}
                                      </span>
                                      {description ? (
                                        <span className="mt-0.5 block text-xs text-neutral-500">
                                          {description}
                                        </span>
                                      ) : null}
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-1 border-t border-neutral-200 pt-4">
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                    Quick links
                  </p>
                  {HEADER_TOP_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-brand-deep"
                      onClick={closeMobile}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-4 space-y-1 border-t border-neutral-200 pt-4 sm:hidden">
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={closeMobile}
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                    {wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                  </Link>
                  <Link
                    href="/compare"
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={closeMobile}
                  >
                    <Scale className="h-4 w-4" />
                    Compare
                    {compareCount > 0 ? ` (${compareCount})` : ''}
                  </Link>
                </div>

                <div className="mt-4 border-t border-neutral-200 pt-4">
                  {user ? (
                    <div className="space-y-1">
                      <div className="mb-2 flex items-center gap-3 px-3 py-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-deep text-xs font-bold text-white">
                          {userInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-900">
                            {userDisplayName}
                          </p>
                          <p className="truncate text-xs text-neutral-500">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/account"
                        className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        onClick={closeMobile}
                      >
                        My Account
                      </Link>
                      {showAdmin ? (
                        <Link
                          href="/admin"
                          className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                          onClick={closeMobile}
                        >
                          Admin Console
                        </Link>
                      ) : null}
                      <Link
                        href="/quotes"
                        className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        onClick={closeMobile}
                      >
                        My Quotes
                      </Link>
                      <Link
                        href="/orders"
                        className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        onClick={closeMobile}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/invoices"
                        className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        onClick={closeMobile}
                      >
                        My Invoices
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          closeMobile();
                          handleLogout();
                        }}
                        disabled={isPending}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {isPending ? 'Signing out...' : 'Sign Out'}
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="block rounded-lg bg-brand-deep px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-natural"
                      onClick={closeMobile}
                    >
                      Sign In / Register
                    </Link>
                  )}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
