'use client';

import { useEffect, useState } from 'react';
import type { AdminDocumentSummary, DocumentType } from '@mcpfac/shared-types';
import {
  attachAdminDocumentProduct,
  createAdminDocument,
  deleteAdminDocument,
  detachAdminDocumentProduct,
  listAdminDocuments,
  listAdminProducts,
  updateAdminDocument,
} from '@/lib/admin-api';
import { AdminTableSkeleton } from '@/components/admin/admin-table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

const DOCUMENT_TYPES: DocumentType[] = [
  'COA',
  'MSDS',
  'HPLC',
  'TECHNICAL_DATASHEET',
  'RESEARCH_DOCUMENT',
  'CERTIFICATE',
  'OTHER',
];

export default function AdminDocumentsPage() {
  const [items, setItems] = useState<AdminDocumentSummary[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType>('COA');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [productSku, setProductSku] = useState('');
  const [attachSkuByDoc, setAttachSkuByDoc] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const result = await listAdminDocuments({
        page: 1,
        limit: 100,
        search: search || undefined,
        type: typeFilter || undefined,
      });
      setItems(result.items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resolveProductIdBySku(sku: string): Promise<string | undefined> {
    const result = await listAdminProducts({ page: 1, limit: 5, search: sku.trim() });
    const match = result.items.find(
      (p) => p.sku.toLowerCase() === sku.trim().toLowerCase(),
    );
    return match?.id ?? result.items[0]?.id;
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !fileUrl.trim() || !fileName.trim()) return;
    try {
      let productId: string | undefined;
      if (productSku.trim()) {
        productId = await resolveProductIdBySku(productSku);
        if (!productId) {
          setError(`No product found for SKU “${productSku.trim()}”`);
          return;
        }
      }
      await createAdminDocument({
        title: title.trim(),
        type,
        fileUrl: fileUrl.trim(),
        fileName: fileName.trim(),
        permission: 'PUBLIC',
        isApproved: true,
        productId,
      });
      setTitle('');
      setFileUrl('');
      setFileName('');
      setProductSku('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  }

  async function toggleApproved(doc: AdminDocumentSummary) {
    setBusyId(doc.id);
    try {
      await updateAdminDocument(doc.id, { isApproved: !doc.isApproved });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(undefined);
    }
  }

  async function onDelete(doc: AdminDocumentSummary) {
    if (!window.confirm(`Soft-delete document “${doc.title}”?`)) return;
    setBusyId(doc.id);
    try {
      await deleteAdminDocument(doc.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusyId(undefined);
    }
  }

  async function onAttach(doc: AdminDocumentSummary) {
    const sku = attachSkuByDoc[doc.id]?.trim();
    if (!sku) return;
    setBusyId(doc.id);
    try {
      const productId = await resolveProductIdBySku(sku);
      if (!productId) {
        setError(`No product found for SKU “${sku}”`);
        return;
      }
      await attachAdminDocumentProduct(doc.id, productId);
      setAttachSkuByDoc((prev) => ({ ...prev, [doc.id]: '' }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Attach failed');
    } finally {
      setBusyId(undefined);
    }
  }

  async function onDetach(docId: string, productId: string) {
    setBusyId(docId);
    try {
      await detachAdminDocumentProduct(docId, productId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detach failed');
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Documents</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Register COA / MSDS / HPLC URLs, approve for public library, and attach to products.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DocumentType)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="File name (e.g. bpc-157-coa.pdf)"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          required
        />
        <input
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="File URL"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
          required
        />
        <input
          value={productSku}
          onChange={(e) => setProductSku(e.target.value)}
          placeholder="Attach product SKU (optional)"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white sm:col-span-2 lg:col-span-3 lg:justify-self-start"
        >
          Create document
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
          placeholder="Search title, SKU, file…"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-neutral-200 px-4 py-2 text-sm">
          Search
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <AdminTableSkeleton cols={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Create a document above or adjust your search."
          className="py-10 shadow-none"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Approved</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((doc) => (
                <tr key={doc.id} className="border-b border-neutral-100 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{doc.title}</p>
                    <p className="text-xs text-neutral-500">{doc.fileName}</p>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-deep underline"
                    >
                      Open URL
                    </a>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{doc.type}</td>
                  <td className="px-4 py-3">
                    <ul className="space-y-1 text-xs text-neutral-600">
                      {doc.products.map((p) => (
                        <li key={p.id} className="flex items-center gap-2">
                          <span>
                            {p.sku} — {p.name}
                          </span>
                          <button
                            type="button"
                            disabled={busyId === doc.id}
                            onClick={() => void onDetach(doc.id, p.id)}
                            className="text-red-600 hover:underline disabled:opacity-50"
                          >
                            Detach
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={attachSkuByDoc[doc.id] ?? ''}
                        onChange={(e) =>
                          setAttachSkuByDoc((prev) => ({ ...prev, [doc.id]: e.target.value }))
                        }
                        placeholder="SKU to attach"
                        className="w-36 rounded border border-neutral-200 px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        disabled={busyId === doc.id}
                        onClick={() => void onAttach(doc)}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs disabled:opacity-50"
                      >
                        Attach
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === doc.id}
                      onClick={() => void toggleApproved(doc)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
                        doc.isApproved
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {doc.isApproved ? 'Approved' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === doc.id}
                      onClick={() => void onDelete(doc)}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
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
