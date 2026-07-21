import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutConfirmationClient } from './confirmation-client';

export const metadata: Metadata = {
  title: 'Order confirmation',
  robots: { index: false, follow: false },
};

export default function CheckoutConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-neutral-500">
          Loading confirmation…
        </div>
      }
    >
      <CheckoutConfirmationClient />
    </Suspense>
  );
}
