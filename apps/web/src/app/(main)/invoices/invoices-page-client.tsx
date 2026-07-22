'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { InvoiceSummary } from '@mcpfac/shared-types';
import { listInvoices } from '@/lib/commerce-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OpsSurface } from '@/components/layout/ops-surface';

export function InvoicesPageClient() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const result = await listInvoices(1, 50);
        if (!cancelled) {
          setInvoices(result.items);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setInvoices([]);
          setError(err instanceof Error ? err.message : 'Failed to load invoices');
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
          <h1 className="font-heading text-4xl font-bold text-brand-deep">My Invoices</h1>
          <p className="mt-3 text-neutral-600">Invoices issued when orders are confirmed.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {isLoading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-neutral-500">
            Loading invoices…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-12 text-center text-red-600">
            {error}
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <h2 className="font-heading text-xl font-semibold text-brand-deep">No invoices yet</h2>
            <p className="mt-2 text-sm text-neutral-500">Confirm a pending order to issue an invoice.</p>
            <Link
              href="/orders"
              className="mt-6 inline-flex rounded-lg bg-brand-deep px-4 py-2 text-sm font-semibold text-white hover:bg-brand-natural"
            >
              View Orders
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-brand-deep hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{invoice.status}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-3 text-neutral-600">{formatDate(invoice.createdAt)}</td>
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
