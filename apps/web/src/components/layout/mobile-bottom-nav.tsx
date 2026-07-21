'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home, Package, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';

const HIDDEN_PREFIXES = ['/admin', '/checkout', '/login', '/register', '/forgot-password'];

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartItemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.count());
  const user = useAuthStore((s) => s.user);
  const toggleCart = useCartStore((s) => s.toggleCart);

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const accountHref = user ? '/account' : '/login';
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Spacer so page content clears the fixed bar */}
      <div className="h-14 shrink-0 lg:hidden" aria-hidden />

      <nav
        aria-label="Mobile quick actions"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-1">
          <li className="flex-1">
            <Link
              href="/"
              className={cn(
                'flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                isActive('/') ? 'text-brand-deep' : 'text-neutral-500 hover:text-brand-deep',
              )}
            >
              <Home className="h-5 w-5" aria-hidden />
              Home
            </Link>
          </li>

          <li className="flex-1">
            <Link
              href="/products"
              className={cn(
                'flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                isActive('/products') ? 'text-brand-deep' : 'text-neutral-500 hover:text-brand-deep',
              )}
            >
              <Package className="h-5 w-5" aria-hidden />
              Products
            </Link>
          </li>

          <li className="flex-1">
            <Link
              href="/wishlist"
              className={cn(
                'relative flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                isActive('/wishlist') ? 'text-brand-deep' : 'text-neutral-500 hover:text-brand-deep',
              )}
              aria-label={
                wishlistCount > 0 ? `Wishlist with ${wishlistCount} items` : 'Wishlist'
              }
            >
              <span className="relative">
                <Heart className="h-5 w-5" aria-hidden />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-deep px-0.5 text-[9px] font-bold text-white">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </span>
              Wishlist
            </Link>
          </li>

          <li className="flex-1">
            <button
              type="button"
              onClick={() => toggleCart()}
              className="relative flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-neutral-500 transition-colors hover:text-brand-deep"
              aria-label={
                cartItemCount > 0
                  ? `Shopping cart with ${cartItemCount} items`
                  : 'Shopping cart'
              }
            >
              <span className="relative">
                <ShoppingCart className="h-5 w-5" aria-hidden />
                {cartItemCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-deep px-0.5 text-[9px] font-bold text-white">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </span>
              Cart
            </button>
          </li>

          <li className="flex-1">
            <Link
              href={accountHref}
              className={cn(
                'flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                isActive('/account') || isActive('/login')
                  ? 'text-brand-deep'
                  : 'text-neutral-500 hover:text-brand-deep',
              )}
            >
              <User className="h-5 w-5" aria-hidden />
              {user ? 'Account' : 'Sign in'}
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
