'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { OrderDetail, OrderStatus } from '@mcpfac/shared-types';
import { PAYMENT_METHOD_OPTIONS, SHIPPING_METHOD_OPTIONS } from '@mcpfac/shared-types';
import { getAdminOrder, updateAdminOrderStatus } from '@/lib/admin-api';
import { formatCurrency, formatDate } from '@/lib/utils';

const NEXT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURNED'],
};

type AdminOrderDetail = OrderDetail & { customerEmail: string; internalNotes?: string };

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await getAdminOrder(params.id);
      setOrder(data);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function setStatus(status: OrderStatus) {
    setBusy(true);
    try {
      await updateAdminOrderStatus(params.id, status, note || undefined);
      await load();
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setBusy(false);
    }
  }

  if (error && !order) return <p className="text-red-600">{error}</p>;
  if (!order) return <p className="text-neutral-500">Loading order…</p>;

  const nextStatuses = NEXT[order.status] ?? [];
  const paymentLabel =
    PAYMENT_METHOD_OPTIONS.find((o) => o.value === order.paymentMethod)?.label ??
    order.paymentMethod?.replaceAll('_', ' ');
  const shippingOption = SHIPPING_METHOD_OPTIONS.find((o) => o.value === order.shippingMethod);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-brand-deep hover:underline">
          ← Orders
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-bold text-brand-deep">{order.orderNumber}</h1>
        <p className="text-sm text-neutral-600">
          {order.customerEmail} · {order.status} · {formatDate(order.createdAt)}
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
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
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-neutral-500">{item.productSku}</p>
                    </td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{formatCurrency(item.unitPrice, order.currency)}</td>
                    <td className="px-4 py-3">{formatCurrency(item.totalPrice, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(order.notes || order.purchaseOrderNumber || order.quoteId) && (
            <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-5 text-sm">
              <h2 className="font-heading text-lg font-semibold text-brand-deep">Order notes</h2>
              {order.purchaseOrderNumber ? (
                <p>
                  <span className="text-neutral-500">PO #:</span> {order.purchaseOrderNumber}
                </p>
              ) : null}
              {order.quoteId ? (
                <p>
                  <span className="text-neutral-500">Quote:</span>{' '}
                  <Link href={`/admin/quotes/${order.quoteId}`} className="text-brand-deep hover:underline">
                    {order.quoteId}
                  </Link>
                </p>
              ) : null}
              {order.notes ? <p className="whitespace-pre-wrap text-neutral-700">{order.notes}</p> : null}
            </div>
          )}

          {nextStatuses.length > 0 ? (
            <div className="max-w-xl space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
              <label className="block text-sm">
                <span className="mb-1 block text-neutral-600">Status note</span>
                <textarea
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={busy}
                    onClick={() => void setStatus(status)}
                    className="rounded-lg bg-brand-deep px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Set {status}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <section>
            <h2 className="font-heading text-lg font-semibold text-brand-deep">Status history</h2>
            {order.statusHistory.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">No status changes yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {order.statusHistory.map((entry) => (
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
            )}
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Totals</h2>
          {paymentLabel ? (
            <div className="rounded-lg border border-brand-pale bg-brand-pale/30 px-3 py-2 text-sm">
              <p className="text-xs text-neutral-500">Payment</p>
              <p className="font-medium text-brand-deep">{paymentLabel}</p>
            </div>
          ) : null}
          {shippingOption || order.shippingMethod ? (
            <div className="rounded-lg border border-neutral-100 px-3 py-2 text-sm">
              <p className="text-xs text-neutral-500">Shipping</p>
              <p className="font-medium text-brand-deep">
                {shippingOption?.label ?? order.shippingMethod?.replaceAll('_', ' ')}
              </p>
              {shippingOption?.eta ? (
                <p className="text-xs text-neutral-500">{shippingOption.eta}</p>
              ) : null}
            </div>
          ) : null}
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
          {order.invoiceIds.length > 0 ? (
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-sm font-medium text-neutral-700">Invoices</p>
              <ul className="mt-2 space-y-1">
                {order.invoiceIds.map((invoiceId) => (
                  <li key={invoiceId}>
                    <span className="font-mono text-xs text-neutral-600">{invoiceId.slice(0, 8)}…</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-neutral-500">
                Issued on confirm. Customer views at /invoices.
              </p>
            </div>
          ) : (
            <p className="border-t border-neutral-100 pt-4 text-xs text-neutral-500">
              Confirm order to issue an invoice.
            </p>
          )}
          {order.internalNotes ? (
            <div className="border-t border-neutral-100 pt-4 text-sm">
              <p className="font-medium text-neutral-700">Internal notes</p>
              <p className="mt-1 whitespace-pre-wrap text-neutral-600">{order.internalNotes}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
