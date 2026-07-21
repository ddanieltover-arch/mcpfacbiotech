'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminInventoryItem } from '@mcpfac/shared-types';
import { listAdminInventory, updateAdminInventory } from '@/lib/admin-api';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<AdminInventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(true);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<
    Record<string, { stockQuantity: string; lowStockThreshold: string }>
  >({});
  const [busyId, setBusyId] = useState<string>();

  async function load(nextLow = lowStockOnly, nextSearch = search) {
    setLoading(true);
    try {
      const result = await listAdminInventory({
        page: 1,
        limit: 50,
        search: nextSearch || undefined,
        lowStockOnly: nextLow ? 'true' : undefined,
      });
      setItems(result.items);
      setDrafts(
        Object.fromEntries(
          result.items.map((item) => [
            item.id,
            {
              stockQuantity: String(item.stockQuantity),
              lowStockThreshold: String(item.lowStockThreshold),
            },
          ]),
        ),
      );
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave(item: AdminInventoryItem) {
    const draft = drafts[item.id];
    if (!draft) return;
    setBusyId(item.id);
    try {
      await updateAdminInventory(item.id, {
        stockQuantity: Number(draft.stockQuantity),
        lowStockThreshold: Number(draft.lowStockThreshold),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Inventory</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Adjust stock levels and per-product low-stock thresholds.
        </p>
      </div>

      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search SKU or name…"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          Low stock only
        </label>
        <button type="submit" className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-neutral-500">Loading…</p> : null}

      {!loading && items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-10 text-center text-sm text-neutral-500">
          {lowStockOnly ? 'No low-stock products right now.' : 'No inventory rows match this filter.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Threshold</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${item.id}`}
                      className="font-medium text-brand-deep hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-neutral-500">{item.sku}</p>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      className="w-24 rounded border border-neutral-200 px-2 py-1"
                      value={drafts[item.id]?.stockQuantity ?? item.stockQuantity}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: {
                            stockQuantity: e.target.value,
                            lowStockThreshold:
                              prev[item.id]?.lowStockThreshold ?? String(item.lowStockThreshold),
                          },
                        }))
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      className="w-24 rounded border border-neutral-200 px-2 py-1"
                      value={drafts[item.id]?.lowStockThreshold ?? item.lowStockThreshold}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: {
                            stockQuantity:
                              prev[item.id]?.stockQuantity ?? String(item.stockQuantity),
                            lowStockThreshold: e.target.value,
                          },
                        }))
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={item.isLowStock ? 'text-amber-700' : 'text-neutral-600'}>
                      {item.availability}
                      {item.isLowStock ? ' · LOW' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void onSave(item)}
                      className="rounded border border-neutral-200 px-2 py-1 text-xs disabled:opacity-50"
                    >
                      Save
                    </button>
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
