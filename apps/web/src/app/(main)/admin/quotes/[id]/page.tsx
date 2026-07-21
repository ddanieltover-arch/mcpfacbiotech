'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { QuoteDetail } from '@mcpfac/shared-types';
import {
  approveAdminQuote,
  getAdminQuote,
  rejectAdminQuote,
  reviewAdminQuote,
} from '@/lib/admin-api';
import { formatCurrency, formatDate } from '@/lib/utils';

type AdminQuoteDetail = QuoteDetail & { customerEmail: string; internalNotes?: string };

export default function AdminQuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const [quote, setQuote] = useState<AdminQuoteDetail | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await getAdminQuote(params.id);
      setQuote(data);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quote');
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function runAction(action: 'review' | 'approve' | 'reject') {
    setBusy(true);
    try {
      if (action === 'review') await reviewAdminQuote(params.id, note || undefined);
      if (action === 'approve') await approveAdminQuote(params.id, note || undefined);
      if (action === 'reject') await rejectAdminQuote(params.id, note || undefined);
      await load();
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  if (error && !quote) return <p className="text-red-600">{error}</p>;
  if (!quote) return <p className="text-neutral-500">Loading quote…</p>;

  const canAct = ['SUBMITTED', 'UNDER_REVIEW', 'REVISED'].includes(quote.status);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/quotes" className="text-sm text-brand-deep hover:underline">
          ← Quotes
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-bold text-brand-deep">{quote.quoteNumber}</h1>
        <p className="text-sm text-neutral-600">
          {quote.customerEmail} · {quote.status} · {formatDate(quote.createdAt)}
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id} className="border-b border-neutral-100">
                <td className="px-4 py-3">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-neutral-500">{item.productSku}</p>
                </td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatCurrency(item.unitPrice, quote.currency)}</td>
                <td className="px-4 py-3">{formatCurrency(item.totalPrice, quote.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-lg font-semibold text-brand-deep">
        Total {formatCurrency(quote.totalAmount, quote.currency)}
      </p>

      {canAct ? (
        <div className="max-w-xl space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
          <label className="block text-sm">
            <span className="mb-1 block text-neutral-600">Decision note</span>
            <textarea
              className="w-full rounded-lg border border-neutral-200 px-3 py-2"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void runAction('review')}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm disabled:opacity-50"
            >
              Mark under review
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void runAction('approve')}
              className="rounded-lg bg-brand-deep px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void runAction('reject')}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      ) : null}

      <section>
        <h2 className="font-heading text-lg font-semibold text-brand-deep">Status history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {quote.statusHistory.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-neutral-100 bg-white px-3 py-2">
              <p>
                {entry.fromStatus ?? '—'} → {entry.toStatus}
              </p>
              <p className="text-xs text-neutral-500">
                {formatDate(entry.createdAt)}
                {entry.note ? ` · ${entry.note}` : ''}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
