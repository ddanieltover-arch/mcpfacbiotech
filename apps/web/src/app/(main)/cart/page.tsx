import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CartPageClient } from './cart-page-client';

export const metadata: Metadata = {
  title: 'Shopping Cart | MCPFAC BIOTECH',
  description: 'Review cart items from the live research catalog and request a quotation.',
};

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-neutral-500">
          Loading cart…
        </div>
      }
    >
      <CartPageClient />
    </Suspense>
  );
}
