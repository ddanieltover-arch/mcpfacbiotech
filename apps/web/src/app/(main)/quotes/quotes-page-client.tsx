'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { QuoteSummary } from '@mcpfac/shared-types';
import { listQuotes } from '@/lib/commerce-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OpsSurface } from '@/components/layout/ops-surface';

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-700',
  SUBMITTED: 'bg-blue-50 text-blue-700',
  UNDER_REVIEW: 'bg-amber-50 text-amber-800',
  REVISED: 'bg-purple-50 text-purple-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  EXPIRED: 'bg-neutral-100 text-neutral-500',
  CONVERTED: 'bg-brand-pale text-brand-deep',
};

export function QuotesPageClient() {
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const result = await listQuotes(1, 50);
        if (!cancelled) {
          setQuotes(result.items);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setQuotes([]);
          setError(err instanceof Error ? err.message : 'Failed to load quotes');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <OpsSurface className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="font-heading text-4xl font-bold text-brand-deep">My Quotes</h1>
          <p className="mt-3 text-neutral-600">
            Track quotation requests built from the live research catalog.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {isLoading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-neutral-500">
            Loading quotes…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-12 text-center text-red-600">
            {error}
          </div>
        ) : quotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <h2 className="font-heading text-xl font-semibold text-brand-deep">No quotes yet</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Add products to your cart and request a quotation to get started.
            </p>
            <Link
              href="/cart"
              className="mt-6 inline-flex rounded-lg bg-brand-deep px-4 py-2 text-sm font-semibold text-white hover:bg-brand-natural"
            >
              Go to Cart
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Quote</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="font-medium text-brand-deep hover:underline"
                      >
                        {quote.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[quote.status] ?? STATUS_STYLES.DRAFT
                        }`}
                      >
                        {quote.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{quote.itemCount}</td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {formatCurrency(quote.totalAmount, quote.currency)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{formatDate(quote.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </OpsSurface>
  );
}
