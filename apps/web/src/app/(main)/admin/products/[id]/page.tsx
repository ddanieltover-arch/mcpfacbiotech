'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { ProductDetail, ProductStatus } from '@mcpfac/shared-types';
import { getAdminProduct, updateAdminProduct } from '@/lib/admin-api';

type AdminProductDetail = ProductDetail & {
  stockQuantity: number;
  isVisible: boolean;
  lowStockThreshold: number;
};

export default function AdminProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [form, setForm] = useState({
    name: '',
    status: 'DRAFT' as ProductStatus,
    stockQuantity: 0,
    lowStockThreshold: 5,
    retailPrice: '',
    wholesalePrice: '',
    isFeatured: false,
    isVisible: true,
    shortDescription: '',
  });
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = (await getAdminProduct(params.id)) as AdminProductDetail;
        if (cancelled) return;
        setProduct(data);
        setForm({
          name: data.name,
          status: data.status,
          stockQuantity: data.stockQuantity ?? 0,
          lowStockThreshold: data.lowStockThreshold ?? 5,
          retailPrice: data.price != null ? String(data.price) : '',
          wholesalePrice: data.wholesalePrice != null ? String(data.wholesalePrice) : '',
          isFeatured: data.isFeatured,
          isVisible: data.isVisible ?? true,
          shortDescription: data.shortDescription ?? '',
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load product');
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(undefined);
    setError(undefined);
    try {
      const updated = (await updateAdminProduct(params.id, {
        name: form.name,
        status: form.status,
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        retailPrice: form.retailPrice === '' ? undefined : Number(form.retailPrice),
        wholesalePrice: form.wholesalePrice === '' ? undefined : Number(form.wholesalePrice),
        isFeatured: form.isFeatured,
        isVisible: form.isVisible,
        shortDescription: form.shortDescription,
      })) as AdminProductDetail;
      setProduct(updated);
      setForm((f) => ({
        ...f,
        stockQuantity: updated.stockQuantity ?? f.stockQuantity,
        lowStockThreshold: updated.lowStockThreshold ?? f.lowStockThreshold,
        isVisible: updated.isVisible ?? f.isVisible,
      }));
      setMessage('Product saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (error && !product) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!product) {
    return <p className="text-neutral-500">Loading product…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-brand-deep hover:underline">
          ← Products
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-bold text-brand-deep">{product.name}</h1>
        <p className="text-sm text-neutral-500">{product.sku}</p>
      </div>

      <form onSubmit={onSave} className="max-w-2xl space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <label className="block text-sm">
          <span className="mb-1 block text-neutral-600">Name</span>
          <input
            className="w-full rounded-lg border border-neutral-200 px-3 py-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-600">Short description</span>
          <textarea
            className="w-full rounded-lg border border-neutral-200 px-3 py-2"
            rows={3}
            value={form.shortDescription}
            onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-neutral-600">Status</span>
            <select
              className="w-full rounded-lg border border-neutral-200 px-3 py-2"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProductStatus }))}
            >
              {(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'] as ProductStatus[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-neutral-600">Stock quantity</span>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2"
              value={form.stockQuantity}
              onChange={(e) => setForm((f) => ({ ...f, stockQuantity: Number(e.target.value) }))}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-neutral-600">Low-stock threshold</span>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2"
              value={form.lowStockThreshold}
              onChange={(e) =>
                setForm((f) => ({ ...f, lowStockThreshold: Number(e.target.value) }))
              }
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-neutral-600">Retail price</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2"
              value={form.retailPrice}
              onChange={(e) => setForm((f) => ({ ...f, retailPrice: e.target.value }))}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-neutral-600">Wholesale price</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2"
              value={form.wholesalePrice}
              onChange={(e) => setForm((f) => ({ ...f, wholesalePrice: e.target.value }))}
            />
          </label>
        </div>

        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
            />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
            />
            Visible
          </label>
        </div>

        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
