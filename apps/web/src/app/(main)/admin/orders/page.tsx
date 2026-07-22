'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminOrderSummary } from '@mcpfac/shared-types';
import { PAYMENT_METHOD_OPTIONS, SHIPPING_METHOD_OPTIONS } from '@mcpfac/shared-types';
import { listAdminOrders } from '@/lib/admin-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AdminTableSkeleton } from '@/components/admin/admin-table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ClipboardList } from 'lucide-react';

function paymentLabel(value?: string) {
  if (!value) return '—';
  return PAYMENT_METHOD_OPTIONS.find((o) => o.value === value)?.label ?? value.replaceAll('_', ' ');
}

function shippingLabel(value?: string) {
  if (!value) return '—';
  return SHIPPING_METHOD_OPTIONS.find((o) => o.value === value)?.label ?? value.replaceAll('_', ' ');
}

export default function AdminOrdersPage() {
  const [items, setItems] = useState<AdminOrderSummary[]>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const result = await listAdminOrders({
        page: 1,
        limit: 50,
        search: search || undefined,
        status: status || undefined,
      });
      setItems(result.items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
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
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Orders</h1>
        <p className="mt-1 text-sm text-neutral-600">Fulfillment status and invoice issuance.</p>
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
          placeholder="Search order # or customer…"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {[
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'PACKED',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
            'RETURNED',
          ].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <AdminTableSkeleton cols={7} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders match this filter"
          description="Try another status or search term to find fulfillment records."
          className="py-10 shadow-none"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Shipping</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr key={order.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-brand-deep hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.customerName}</p>
                    <p className="text-xs text-neutral-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{paymentLabel(order.paymentMethod)}</td>
                  <td className="px-4 py-3">{shippingLabel(order.shippingMethod)}</td>
                  <td className="px-4 py-3">{formatCurrency(order.totalAmount, order.currency)}</td>
                  <td className="px-4 py-3 text-neutral-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
