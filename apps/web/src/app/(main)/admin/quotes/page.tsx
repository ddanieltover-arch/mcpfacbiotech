'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminQuoteSummary } from '@mcpfac/shared-types';
import { listAdminQuotes } from '@/lib/admin-api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminQuotesPage() {
  const [items, setItems] = useState<AdminQuoteSummary[]>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const result = await listAdminQuotes({
        page: 1,
        limit: 50,
        search: search || undefined,
        status: status || undefined,
      });
      setItems(result.items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Quotes</h1>
        <p className="mt-1 text-sm text-neutral-600">Review, approve, or reject customer quotations.</p>
      </div>

      <form
        className="flex flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quote # or customer…"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {['SUBMITTED', 'UNDER_REVIEW', 'REVISED', 'APPROVED', 'REJECTED', 'CONVERTED', 'DRAFT'].map(
            (value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ),
          )}
        </select>
        <button type="submit" className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-neutral-500">Loading…</p> : null}

      {!loading && items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-10 text-center text-sm text-neutral-500">
          No quotes match this filter.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Quote</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((quote) => (
                <tr key={quote.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <Link href={`/admin/quotes/${quote.id}`} className="font-medium text-brand-deep hover:underline">
                      {quote.quoteNumber}
                    </Link>
                    <p className="text-xs text-neutral-500">{quote.itemCount} items</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{quote.customerName}</p>
                    <p className="text-xs text-neutral-500">{quote.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">{quote.status}</td>
                  <td className="px-4 py-3">{formatCurrency(quote.totalAmount, quote.currency)}</td>
                  <td className="px-4 py-3 text-neutral-500">{formatDate(quote.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
