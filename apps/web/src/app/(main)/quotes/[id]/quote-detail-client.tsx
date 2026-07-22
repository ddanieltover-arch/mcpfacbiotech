'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import type { QuoteDetail } from '@mcpfac/shared-types';
import { getQuote, submitQuote } from '@/lib/commerce-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OpsSurface } from '@/components/layout/ops-surface';

export function QuoteDetailClient() {
  const params = useParams<{ id: string }>();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await getQuote(params.id);
        if (!cancelled) {
          setQuote(data);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setQuote(null);
          setError(err instanceof Error ? err.message : 'Failed to load quote');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleSubmit = () => {
    if (!quote) return;

    startTransition(async () => {
      try {
        const updated = await submitQuote(quote.id);
        setQuote(updated);
        toast.success('Quote submitted for review');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Submit failed');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-neutral-500">
        Loading quote…
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-red-600">{error ?? 'Quote not found'}</p>
        <Link href="/quotes" className="mt-4 inline-block text-sm text-brand-deep hover:underline">
          Back to quotes
        </Link>
      </div>
    );
  }

  return (
    <OpsSurface className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <Link href="/quotes" className="text-sm text-brand-deep hover:underline">
            ← All quotes
          </Link>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-4xl font-bold text-brand-deep">
                {quote.quoteNumber}
              </h1>
              <p className="mt-2 text-neutral-600">
                Status: <span className="font-medium">{quote.status.replaceAll('_', ' ')}</span>
              </p>
            </div>
            {quote.status === 'DRAFT' && (
              <button
                type="button"
                disabled={isPending}
                onClick={handleSubmit}
                className="rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-natural disabled:opacity-60"
              >
                {isPending ? 'Submitting…' : 'Submit Quote'}
              </button>
            )}
            {(quote.status === 'SUBMITTED' || quote.status === 'APPROVED') && (
              <Link
                href={`/checkout?quoteId=${quote.id}`}
                className="rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-natural"
              >
                Convert to Order
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">{item.productName}</p>
                      <p className="text-xs text-neutral-500">{item.productSku}</p>
                      {item.notes && (
                        <p className="mt-1 text-xs text-neutral-500">{item.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{formatCurrency(item.unitPrice, quote.currency)}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(item.totalPrice, quote.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {quote.notes && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="font-heading text-lg font-semibold text-brand-deep">Notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{quote.notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-heading text-lg font-semibold text-brand-deep">Status history</h2>
            <ol className="mt-4 space-y-3">
              {quote.statusHistory.map((entry) => (
                <li key={entry.id} className="border-l-2 border-brand-pale pl-4">
                  <p className="text-sm font-medium text-neutral-900">
                    {entry.fromStatus ? `${entry.fromStatus} → ${entry.toStatus}` : entry.toStatus}
                  </p>
                  {entry.note && <p className="text-xs text-neutral-500">{entry.note}</p>}
                  <p className="text-xs text-neutral-400">{formatDate(entry.createdAt)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Totals</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Subtotal</dt>
              <dd>{formatCurrency(quote.subtotal, quote.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Shipping</dt>
              <dd>{formatCurrency(quote.shippingCost, quote.currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2 font-semibold text-brand-deep">
              <dt>Total</dt>
              <dd>{formatCurrency(quote.totalAmount, quote.currency)}</dd>
            </div>
          </dl>
          {quote.purchaseOrderNumber && (
            <p className="mt-4 text-xs text-neutral-500">PO: {quote.purchaseOrderNumber}</p>
          )}
          {quote.expiresAt && (
            <p className="mt-2 text-xs text-neutral-500">Expires {formatDate(quote.expiresAt)}</p>
          )}
          <p className="mt-2 text-xs text-neutral-500">Created {formatDate(quote.createdAt)}</p>
        </aside>
      </div>
    </OpsSurface>
  );
}
