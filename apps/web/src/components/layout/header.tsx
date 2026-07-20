'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  User,
  ChevronDown,
  Beaker,
  LogOut,
  Package,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { fadeInDown } from '@/lib/motion';
import { logout } from '@/app/(auth)/actions';

const navigation = [
  {
    name: 'Products',
    href: '/products',
    children: [
      { name: 'All Products', href: '/products' },
      { name: 'Research Peptides', href: '/products?category=research-peptides' },
      { name: 'Research Chemicals', href: '/products?category=research-chemicals' },
      { name: 'Laboratory Supplies', href: '/products?category=laboratory-supplies' },
      { name: 'Analytical Standards', href: '/products?category=analytical-standards' },
    ],
  },
  {
    name: 'Solutions',
    href: '/solutions',
    children: [
      { name: 'For Universities', href: '/solutions/universities' },
      { name: 'For Research Labs', href: '/solutions/research-labs' },
      { name: 'For Pharma Companies', href: '/solutions/pharmaceutical' },
      { name: 'For Distributors', href: '/solutions/distributors' },
    ],
  },
  { name: 'Research', href: '/research' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartItemCount = useCartStore((s) => s.itemCount());
  const { user, isLoading: authLoading } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  const userDisplayName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ''}`.trim()
    : user?.email?.split('@')[0] ?? '';

  const userInitials = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name?.[0] ?? ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-neutral-200/50">
      {/* Top bar */}
      <div className="bg-brand-deep text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <span className="hidden sm:inline">
            🌐 Global biotechnology research laboratory — Serving 50+ countries
          </span>
          <div className="flex items-center gap-4">
            <Link href="/support" className="transition-colors hover:text-brand-light">
              Support
            </Link>
            <Link href="/downloads" className="transition-colors hover:text-brand-light">
              Downloads
            </Link>
            <span className="text-brand-light">info@mcpfacbiotech.cn</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Beaker className="h-7 w-7 text-brand-deep" strokeWidth={1.5} />
            <div className="flex flex-col leading-none">
              <span className="font-heading text-lg font-bold tracking-tight text-brand-deep">
                MCPFAC
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-natural">
                BIOTECH
              </span>
            </div>
          </Link>

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

                {/* Dropdown */}
                <AnimatePresence>
                  {'children' in item && activeDropdown === item.name && (
                    <motion.div
                      variants={fadeInDown}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-brand-pale hover:text-brand-deep"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-deep"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* ── User Account ──────────────────────────────────────── */}
            {!authLoading && user ? (
              // Logged in — show user avatar dropdown
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
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-brand-pale hover:text-brand-deep"
                        >
                          <Package className="h-4 w-4" />
                          My Orders
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
              // Logged out — show Sign In link
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
              {cartItemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-deep text-[10px] font-bold text-white">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-neutral-200 bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-brand-deep"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {'children' in item && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-sm text-neutral-500 transition-colors hover:text-brand-deep"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* ── Mobile Auth Section ─────────────────────────────── */}
              <div className="mt-4 border-t border-neutral-200 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-deep text-xs font-bold text-white">
                        {userInitials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{userDisplayName}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/account"
                      className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setMobileOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setMobileOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
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
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
