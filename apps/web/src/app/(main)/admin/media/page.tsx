'use client';

import { useEffect, useState } from 'react';
import type { AdminMediaSummary } from '@mcpfac/shared-types';
import {
  createAdminMedia,
  deleteAdminMedia,
  listAdminMedia,
  updateAdminMedia,
} from '@/lib/admin-api';
import { AdminTableSkeleton } from '@/components/admin/admin-table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ImageIcon } from 'lucide-react';

export default function AdminMediaPage() {
  const [items, setItems] = useState<AdminMediaSummary[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();

  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [alt, setAlt] = useState('');
  const [folder, setFolder] = useState('general');

  async function load() {
    setLoading(true);
    try {
      const result = await listAdminMedia({
        page: 1,
        limit: 100,
        search: search || undefined,
      });
      setItems(result.items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
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
    if (!fileName.trim() || !fileUrl.trim() || !mimeType.trim()) return;
    try {
      await createAdminMedia({
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
        mimeType: mimeType.trim(),
        alt: alt.trim() || undefined,
        folder: folder.trim() || 'general',
      });
      setFileName('');
      setFileUrl('');
      setAlt('');
      setFolder('general');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  }

  async function onDelete(asset: AdminMediaSummary) {
    if (!window.confirm(`Delete media “${asset.fileName}”?`)) return;
    setBusyId(asset.id);
    try {
      await deleteAdminMedia(asset.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusyId(undefined);
    }
  }

  async function onSaveAlt(asset: AdminMediaSummary, nextAlt: string) {
    setBusyId(asset.id);
    try {
      await updateAdminMedia(asset.id, { alt: nextAlt });
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
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Media library</h1>
        <p className="mt-1 text-sm text-neutral-600">
          URL-based asset registry (folder, alt, mime). Binary upload can come later via Storage.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="File name"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          required
        />
        <input
          value={mimeType}
          onChange={(e) => setMimeType(e.target.value)}
          placeholder="MIME type"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          required
        />
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="Folder"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <input
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="File URL"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
          required
        />
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Alt text"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white sm:col-span-2 lg:col-span-3 lg:justify-self-start"
        >
          Register asset
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
          placeholder="Search file name, alt, folder…"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg border border-neutral-200 px-4 py-2 text-sm">
          Search
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <AdminTableSkeleton cols={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No media assets"
          description="Register a URL-based asset above."
          className="py-10 shadow-none"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Folder</th>
                <th className="px-4 py-3">Alt</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((asset) => (
                <tr key={asset.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{asset.fileName}</p>
                    <p className="text-xs text-neutral-500">{asset.mimeType}</p>
                    <a
                      href={asset.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-deep underline"
                    >
                      Open URL
                    </a>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{asset.folder}</td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={asset.alt ?? ''}
                      disabled={busyId === asset.id}
                      onBlur={(e) => {
                        if (e.target.value !== (asset.alt ?? '')) {
                          void onSaveAlt(asset, e.target.value);
                        }
                      }}
                      className="w-full min-w-[160px] rounded border border-neutral-200 px-2 py-1 text-xs disabled:opacity-50"
                      placeholder="Alt text"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === asset.id}
                      onClick={() => void onDelete(asset)}
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
