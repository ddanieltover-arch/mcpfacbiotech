'use client';

import { useEffect, useState } from 'react';
import type { AdminCategorySummary } from '@mcpfac/shared-types';
import {
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategories,
  updateAdminCategory,
} from '@/lib/admin-api';
import { AdminTableSkeleton } from '@/components/admin/admin-table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Tags } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<AdminCategorySummary[]>([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();

  async function load() {
    setLoading(true);
    try {
      const result = await listAdminCategories({
        page: 1,
        limit: 100,
        search: search || undefined,
      });
      setItems(result.items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await createAdminCategory({ name: name.trim(), isVisible: true });
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  }

  async function toggleVisible(category: AdminCategorySummary) {
    setBusyId(category.id);
    try {
      await updateAdminCategory(category.id, { isVisible: !category.isVisible });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(undefined);
    }
  }

  async function toggleFeatured(category: AdminCategorySummary) {
    setBusyId(category.id);
    try {
      await updateAdminCategory(category.id, { isFeatured: !category.isFeatured });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(undefined);
    }
  }

  async function onDelete(category: AdminCategorySummary) {
    if (!window.confirm(`Soft-delete category “${category.name}”?`)) return;
    setBusyId(category.id);
    try {
      await deleteAdminCategory(category.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Categories</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Manage catalog taxonomy, visibility, and featured categories.
        </p>
      </div>

      <form onSubmit={onCreate} className="flex flex-wrap gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white">
          Create
        </button>
      </form>

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
          placeholder="Search categories…"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg border border-neutral-200 px-4 py-2 text-sm">
          Search
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <AdminTableSkeleton cols={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories found"
          description="Create a category above or adjust your search."
          className="py-10 shadow-none"
        />
      ) : (
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((category) => (
              <tr key={category.id} className="border-b border-neutral-100">
                <td className="px-4 py-3">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-neutral-500">{category.slug}</p>
                </td>
                <td className="px-4 py-3 text-neutral-600">{category.parentName ?? '—'}</td>
                <td className="px-4 py-3">
                  {category.productCount}
                  {category.childrenCount > 0 ? (
                    <span className="text-xs text-neutral-400"> · {category.childrenCount} children</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs">
                  {category.isVisible ? 'Visible' : 'Hidden'}
                  {category.isFeatured ? ' · Featured' : ''}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyId === category.id}
                      onClick={() => void toggleVisible(category)}
                      className="rounded border border-neutral-200 px-2 py-1 text-xs disabled:opacity-50"
                    >
                      {category.isVisible ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === category.id}
                      onClick={() => void toggleFeatured(category)}
                      className="rounded border border-neutral-200 px-2 py-1 text-xs disabled:opacity-50"
                    >
                      {category.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === category.id || category.childrenCount > 0}
                      onClick={() => void onDelete(category)}
                      className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 disabled:opacity-50"
                    >
                      Delete
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
