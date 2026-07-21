import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutPageClient } from './checkout-page-client';

export const metadata: Metadata = {
  title: 'Checkout | MCPFAC BIOTECH',
  description: 'Place a research product order from cart or quote.',
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-neutral-500">
          Loading checkout…
        </div>
      }
    >
      <CheckoutPageClient />
    </Suspense>
  );
}
