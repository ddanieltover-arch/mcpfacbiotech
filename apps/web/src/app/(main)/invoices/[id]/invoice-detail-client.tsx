'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { InvoiceDetail } from '@mcpfac/shared-types';
import { getInvoice } from '@/lib/commerce-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OpsSurface } from '@/components/layout/ops-surface';

export function InvoiceDetailClient() {
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await getInvoice(params.id);
        if (!cancelled) {
          setInvoice(data);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setInvoice(null);
          setError(err instanceof Error ? err.message : 'Failed to load invoice');
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-neutral-500">
        Loading invoice…
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-red-600">{error ?? 'Invoice not found'}</p>
        <Link href="/invoices" className="mt-4 inline-block text-sm text-brand-deep hover:underline">
          Back to invoices
        </Link>
      </div>
    );
  }

  return (
    <OpsSurface className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <Link href="/invoices" className="text-sm text-brand-deep hover:underline">
            ← All invoices
          </Link>
          <h1 className="mt-3 font-heading text-4xl font-bold text-brand-deep">
            {invoice.invoiceNumber}
          </h1>
          <p className="mt-2 text-neutral-600">
            Status: <span className="font-medium">{invoice.status}</span>
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_280px]">
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
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-neutral-500">{item.productSku}</p>
                  </td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(item.totalPrice, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoice.notes && (
            <div className="border-t border-neutral-100 p-5 text-sm text-neutral-700">
              {invoice.notes}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-5 text-sm">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Subtotal</dt>
              <dd>{formatCurrency(invoice.subtotal, invoice.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Tax</dt>
              <dd>{formatCurrency(invoice.taxAmount, invoice.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Shipping</dt>
              <dd>{formatCurrency(invoice.shippingCost, invoice.currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2 font-semibold text-brand-deep">
              <dt>Total</dt>
              <dd>{formatCurrency(invoice.totalAmount, invoice.currency)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-neutral-500">Due {formatDate(invoice.dueDate)}</p>
          <Link
            href={`/orders/${invoice.orderId}`}
            className="mt-3 inline-block text-sm text-brand-deep hover:underline"
          >
            View related order
          </Link>
        </aside>
      </div>
    </OpsSurface>
  );
}
