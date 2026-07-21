'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import type { OrderDetail } from '@mcpfac/shared-types';
import { cancelOrder, confirmOrder, getOrder } from '@/lib/commerce-api';
import { formatCurrency, formatDate } from '@/lib/utils';

export function OrderDetailClient() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await getOrder(params.id);
        if (!cancelled) {
          setOrder(data);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setOrder(null);
          setError(err instanceof Error ? err.message : 'Failed to load order');
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

  const runAction = (action: 'confirm' | 'cancel') => {
    if (!order) return;
    startTransition(async () => {
      try {
        const updated =
          action === 'confirm' ? await confirmOrder(order.id) : await cancelOrder(order.id);
        setOrder(updated);
        toast.success(action === 'confirm' ? 'Order confirmed — invoice issued' : 'Order cancelled');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Action failed');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-neutral-500">Loading order…</div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-red-600">{error ?? 'Order not found'}</p>
        <Link href="/orders" className="mt-4 inline-block text-sm text-brand-deep hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <Link href="/orders" className="text-sm text-brand-deep hover:underline">
            ← All orders
          </Link>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-4xl font-bold text-brand-deep">{order.orderNumber}</h1>
              <p className="mt-2 text-neutral-600">
                Status: <span className="font-medium">{order.status}</span>
              </p>
            </div>
            {order.status === 'PENDING' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction('confirm')}
                  className="rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-natural disabled:opacity-60"
                >
                  Confirm Order
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction('cancel')}
                  className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
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
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">{item.productName}</p>
                      <p className="text-xs text-neutral-500">{item.productSku}</p>
                    </td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{formatCurrency(item.unitPrice, order.currency)}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(item.totalPrice, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.notes && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="font-heading text-lg font-semibold text-brand-deep">Notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{order.notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-heading text-lg font-semibold text-brand-deep">Status history</h2>
            <ol className="mt-4 space-y-3">
              {order.statusHistory.map((entry) => (
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

        <aside className="h-fit space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Totals</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Subtotal</dt>
              <dd>{formatCurrency(order.subtotal, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Shipping</dt>
              <dd>{formatCurrency(order.shippingCost, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Tax</dt>
              <dd>{formatCurrency(order.taxAmount, order.currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2 font-semibold text-brand-deep">
              <dt>Total</dt>
              <dd>{formatCurrency(order.totalAmount, order.currency)}</dd>
            </div>
          </dl>
          {order.invoiceIds.length > 0 && (
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-sm font-medium text-neutral-700">Invoices</p>
              <ul className="mt-2 space-y-1">
                {order.invoiceIds.map((invoiceId) => (
                  <li key={invoiceId}>
                    <Link href={`/invoices/${invoiceId}`} className="text-sm text-brand-deep hover:underline">
                      View invoice
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-neutral-500">Created {formatDate(order.createdAt)}</p>
        </aside>
      </div>
    </div>
  );
}
