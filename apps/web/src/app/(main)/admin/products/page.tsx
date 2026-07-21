'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminProductSummary, ProductStatus } from '@mcpfac/shared-types';
import { listAdminProducts, updateAdminProduct } from '@/lib/admin-api';
import { formatCurrency } from '@/lib/utils';

const STATUSES: ProductStatus[] = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'];

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProductSummary[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();

  async function load(nextSearch = search, nextStatus = status) {
    setLoading(true);
    try {
      const result = await listAdminProducts({
        page: 1,
        limit: 50,
        search: nextSearch || undefined,
        status: nextStatus || undefined,
      });
      setItems(result.items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setProductStatus(id: string, next: ProductStatus) {
    setBusyId(id);
    try {
      await updateAdminProduct(id, { status: next });
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
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Products</h1>
        <p className="mt-1 text-sm text-neutral-600">Publish, feature, and adjust inventory.</p>
      </div>

      <form
        className="flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, SKU, CAS…"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white"
        >
          Filter
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-neutral-500">Loading…</p> : null}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id} className="border-b border-neutral-100">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-brand-deep hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-neutral-500">{product.sku}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs">{product.status}</span>
                </td>
                <td className="px-4 py-3">
                  {product.stockQuantity}
                  <p className="text-xs text-neutral-400">{product.availability}</p>
                </td>
                <td className="px-4 py-3">
                  {product.retailPrice != null ? formatCurrency(product.retailPrice) : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {product.status !== 'PUBLISHED' ? (
                      <button
                        type="button"
                        disabled={busyId === product.id}
                        onClick={() => void setProductStatus(product.id, 'PUBLISHED')}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-brand-pale disabled:opacity-50"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === product.id}
                        onClick={() => void setProductStatus(product.id, 'ARCHIVED')}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50"
                      >
                        Archive
                      </button>
                    )}
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-100"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
