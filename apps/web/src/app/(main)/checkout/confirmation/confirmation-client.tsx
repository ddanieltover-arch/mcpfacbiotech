'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export function CheckoutConfirmationClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const email = searchParams.get('email');

  return (
    <div className="bg-neutral-50">
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale text-brand-deep">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep sm:text-4xl">
          Order placed
        </h1>
        {orderNumber ? (
          <p className="mt-3 text-lg text-neutral-700">
            Reference:{' '}
            <span className="font-semibold text-brand-deep">{orderNumber}</span>
          </p>
        ) : null}
        <p className="mt-4 text-neutral-600">
          {email
            ? `Confirmation and payment instructions will be sent to ${email}.`
            : 'Confirmation and payment instructions will be emailed shortly.'}
        </p>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 text-left">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">
            Optional: create an account
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Sign up with the same email to track this order, save addresses, and speed up future
            research purchases.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/register?redirect=${encodeURIComponent('/orders')}`}
              className="inline-flex rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-natural"
            >
              Create account
            </Link>
            <Link
              href="/products"
              className="inline-flex rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
