'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { OrderSummary } from '@mcpfac/shared-types';
import { listOrders } from '@/lib/commerce-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OpsSurface } from '@/components/layout/ops-surface';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-800',
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  PACKED: 'bg-blue-50 text-blue-700',
  SHIPPED: 'bg-brand-pale text-brand-deep',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
  RETURNED: 'bg-neutral-100 text-neutral-600',
};

export function OrdersPageClient() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const result = await listOrders(1, 50);
        if (!cancelled) {
          setOrders(result.items);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setOrders([]);
          setError(err instanceof Error ? err.message : 'Failed to load orders');
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
          <h1 className="font-heading text-4xl font-bold text-brand-deep">My Orders</h1>
          <p className="mt-3 text-neutral-600">Track research orders placed from cart or quotes.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {isLoading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-neutral-500">
            Loading orders…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-12 text-center text-red-600">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <h2 className="font-heading text-xl font-semibold text-brand-deep">No orders yet</h2>
            <p className="mt-2 text-sm text-neutral-500">Checkout from your cart or convert a submitted quote.</p>
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
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${order.id}`} className="font-medium text-brand-deep hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.itemCount}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{formatDate(order.createdAt)}</td>
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
