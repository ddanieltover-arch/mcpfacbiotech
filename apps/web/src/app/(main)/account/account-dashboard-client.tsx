'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AccountDashboard } from '@mcpfac/shared-types';
import { getAccountDashboard } from '@/lib/commerce-api';
import { formatCurrency, formatDate } from '@/lib/utils';

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

export function AccountDashboardClient() {
  const [data, setData] = useState<AccountDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const dashboard = await getAccountDashboard();
        if (!cancelled) {
          setData(dashboard);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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

  if (isLoading) {
    return <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-neutral-500">Loading dashboard…</div>;
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-12 text-center text-red-600">
        {error ?? 'Dashboard unavailable'}
      </div>
    );
  }

  const { profile, counts } = data;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">
          Welcome, {profile.firstName}
        </h1>
        <p className="mt-2 text-neutral-600">
          {profile.organizationName
            ? `${profile.organizationName} · ${profile.customerGroup.replaceAll('_', ' ')}`
            : profile.customerGroup.replaceAll('_', ' ')}{' '}
          account
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Orders" value={counts.orders} href="/orders" />
        <StatCard label="Quotes" value={counts.quotes} href="/quotes" />
        <StatCard label="Invoices" value={counts.invoices} href="/invoices" />
        <StatCard label="Wishlist" value={counts.wishlist} href="/wishlist" />
        <StatCard label="Addresses" value={counts.addresses} href="/account/addresses" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <RecentPanel
          title="Recent orders"
          href="/orders"
          empty="No orders yet"
          items={data.recentOrders.map((order) => ({
            id: order.id,
            href: `/orders/${order.id}`,
            primary: order.orderNumber,
            secondary: order.status,
            meta: formatCurrency(order.totalAmount, order.currency),
            date: formatDate(order.createdAt),
          }))}
        />
        <RecentPanel
          title="Recent quotes"
          href="/quotes"
          empty="No quotes yet"
          items={data.recentQuotes.map((quote) => ({
            id: quote.id,
            href: `/quotes/${quote.id}`,
            primary: quote.quoteNumber,
            secondary: quote.status.replaceAll('_', ' '),
            meta: formatCurrency(quote.totalAmount, quote.currency),
            date: formatDate(quote.createdAt),
          }))}
        />
        <RecentPanel
          title="Recent invoices"
          href="/invoices"
          empty="No invoices yet"
          items={data.recentInvoices.map((invoice) => ({
            id: invoice.id,
            href: `/invoices/${invoice.id}`,
            primary: invoice.invoiceNumber,
            secondary: invoice.status,
            meta: formatCurrency(invoice.totalAmount, invoice.currency),
            date: formatDate(invoice.dueDate),
          }))}
        />
      </section>
    </div>
  );
}

function RecentPanel({
  title,
  href,
  empty,
  items,
}: {
  title: string;
  href: string;
  empty: string;
  items: Array<{
    id: string;
    href: string;
    primary: string;
    secondary: string;
    meta: string;
    date: string;
  }>;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-brand-deep">{title}</h2>
        <Link href={href} className="text-xs font-medium text-brand-deep hover:underline">
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="block rounded-lg p-2 hover:bg-neutral-50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{item.primary}</p>
                    <p className="text-xs text-neutral-500">{item.secondary}</p>
                  </div>
                  <p className="text-sm font-semibold text-brand-deep">{item.meta}</p>
                </div>
                <p className="mt-1 text-xs text-neutral-400">{item.date}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
