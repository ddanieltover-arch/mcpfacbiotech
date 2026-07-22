'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminDashboard } from '@mcpfac/shared-types';
import { getAdminDashboard } from '@/lib/admin-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AdminDashboardSkeleton } from '@/components/admin/admin-table-skeleton';

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-brand-deep/30 hover:bg-brand-pale/40"
    >
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 font-heading text-3xl font-bold text-brand-deep">{value}</p>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const dashboard = await getAdminDashboard();
        if (!cancelled) {
          setData(dashboard);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load admin dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  if (error || !data) {
    return <p className="text-red-600">{error ?? 'No data'}</p>;
  }

  const { counts } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Operations console</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Catalog, quotes, orders, and customer controls.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Published products" value={counts.publishedProducts} href="/admin/products" />
        <StatCard label="Low stock" value={counts.lowStockProducts} href="/admin/inventory" />
        <StatCard label="Pending quotes" value={counts.pendingQuotes} href="/admin/quotes" />
        <StatCard label="Pending orders" value={counts.pendingOrders} href="/admin/orders" />
        <StatCard label="Open orders" value={counts.openOrders} href="/admin/orders" />
        <StatCard label="Customers" value={counts.customers} href="/admin/customers" />
        <StatCard label="Total products" value={counts.products} href="/admin/products" />
        <StatCard label="Issued invoices" value={counts.invoicesIssued} href="/admin/orders" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Recent orders</h2>
          {data.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.recentOrders.map((order) => (
                <li key={order.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-deep hover:underline">
                      {order.orderNumber}
                    </Link>
                    <p className="text-neutral-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatCurrency(order.totalAmount, order.currency)}</p>
                    <p className="text-xs text-neutral-400">{order.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Recent quotes</h2>
          {data.recentQuotes.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No quotes yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.recentQuotes.map((quote) => (
                <li key={quote.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <Link href={`/admin/quotes/${quote.id}`} className="font-medium text-brand-deep hover:underline">
                      {quote.quoteNumber}
                    </Link>
                    <p className="text-neutral-500">{quote.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatCurrency(quote.totalAmount, quote.currency)}</p>
                    <p className="text-xs text-neutral-400">{quote.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-brand-deep">Recent customers</h2>
          {data.recentCustomers.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No customers yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.recentCustomers.map((customer) => (
                <li key={customer.id} className="text-sm">
                  <p className="font-medium text-neutral-900">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-neutral-500">{customer.email}</p>
                  <p className="text-xs text-neutral-400">
                    {customer.customerGroup} · {formatDate(customer.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
