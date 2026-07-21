'use client';

import { useEffect, useState } from 'react';
import type { AdminCustomerSummary } from '@mcpfac/shared-types';
import { listAdminCustomers, updateAdminCustomer } from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [items, setItems] = useState<AdminCustomerSummary[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();

  async function load() {
    setLoading(true);
    try {
      const result = await listAdminCustomers({
        page: 1,
        limit: 50,
        search: search || undefined,
      });
      setItems(result.items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleSuspend(customer: AdminCustomerSummary) {
    setBusyId(customer.id);
    try {
      await updateAdminCustomer(customer.id, { isSuspended: !customer.isSuspended });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(undefined);
    }
  }

  async function toggleVerify(customer: AdminCustomerSummary) {
    setBusyId(customer.id);
    try {
      await updateAdminCustomer(customer.id, { isVerified: !customer.isVerified });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Customers</h1>
        <p className="mt-1 text-sm text-neutral-600">Verify accounts and suspend abuse.</p>
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
          placeholder="Search email or organization…"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white">
          Search
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-neutral-500">Loading…</p> : null}

      {!loading && items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-10 text-center text-sm text-neutral-500">
          No customers found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((customer) => (
                <tr key={customer.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-xs text-neutral-500">{customer.email}</p>
                    {customer.organizationName ? (
                      <p className="text-xs text-neutral-400">{customer.organizationName}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {customer.customerGroup}
                    {customer.isVerified ? (
                      <p className="text-xs text-emerald-700">Verified</p>
                    ) : (
                      <p className="text-xs text-amber-700">Unverified</p>
                    )}
                    {customer.isSuspended ? (
                      <p className="text-xs text-red-600">Suspended</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {customer.ordersCount} orders · {customer.quotesCount} quotes
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{formatDate(customer.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === customer.id}
                        onClick={() => void toggleVerify(customer)}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                      >
                        {customer.isVerified ? 'Unverify' : 'Verify'}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === customer.id}
                        onClick={() => void toggleSuspend(customer)}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                      >
                        {customer.isSuspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
