'use client';

import { useEffect, useState } from 'react';
import type { AdminBlogPostSummary, BlogPostStatus } from '@mcpfac/shared-types';
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  listAdminBlogPosts,
  updateAdminBlogPost,
} from '@/lib/admin-api';
import { AdminTableSkeleton } from '@/components/admin/admin-table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Newspaper } from 'lucide-react';

const STATUSES: BlogPostStatus[] = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'];

const DEFAULT_CONTENT = JSON.stringify(
  {
    readingTime: '3 min',
    sections: [
      {
        heading: 'Introduction',
        paragraphs: ['Write the first section here.'],
      },
    ],
  },
  null,
  2,
);

export default function AdminBlogPage() {
  const [items, setItems] = useState<AdminBlogPostSummary[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [readingTime, setReadingTime] = useState('3 min');
  const [createStatus, setCreateStatus] = useState<BlogPostStatus>('DRAFT');
  const [content, setContent] = useState(DEFAULT_CONTENT);

  async function load() {
    setLoading(true);
    try {
      const result = await listAdminBlogPosts({
        page: 1,
        limit: 100,
        search: search || undefined,
        status: status || undefined,
      });
      setItems(result.items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
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
    if (!title.trim() || !content.trim()) return;
    try {
      await createAdminBlogPost({
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        categoryName: categoryName.trim() || undefined,
        readingTime: readingTime.trim() || undefined,
        status: createStatus,
        content: content.trim(),
      });
      setTitle('');
      setSlug('');
      setExcerpt('');
      setCategoryName('');
      setReadingTime('3 min');
      setCreateStatus('DRAFT');
      setContent(DEFAULT_CONTENT);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  }

  async function onSetStatus(post: AdminBlogPostSummary, next: BlogPostStatus) {
    setBusyId(post.id);
    try {
      await updateAdminBlogPost(post.id, { status: next });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(undefined);
    }
  }

  async function onDelete(post: AdminBlogPostSummary) {
    if (!window.confirm(`Archive/delete “${post.title}”?`)) return;
    setBusyId(post.id);
    try {
      await deleteAdminBlogPost(post.id);
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
        <h1 className="font-heading text-3xl font-bold text-brand-deep">Blog</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Create and publish posts. Content accepts JSON sections (preferred) or plain text.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          required
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug (optional)"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <input
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <input
          value={readingTime}
          onChange={(e) => setReadingTime(e.target.value)}
          placeholder="Reading time"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Excerpt"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          value={createStatus}
          onChange={(e) => setCreateStatus(e.target.value as BlogPostStatus)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="rounded-lg border border-neutral-200 px-3 py-2 font-mono text-xs sm:col-span-2"
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white sm:col-span-2 sm:justify-self-start"
        >
          Create post
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
          placeholder="Search title, slug, author…"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-neutral-200 px-4 py-2 text-sm">
          Filter
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <AdminTableSkeleton cols={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No blog posts"
          description="Create a post above, or run pnpm db:seed to load editorial seeds."
          className="py-10 shadow-none"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Post</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((post) => (
                <tr key={post.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{post.title}</p>
                    <p className="text-xs text-neutral-500">
                      /{post.slug}
                      {post.categoryName ? ` · ${post.categoryName}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={post.status}
                      disabled={busyId === post.id}
                      onChange={(e) => void onSetStatus(post, e.target.value as BlogPostStatus)}
                      className="rounded border border-neutral-200 px-2 py-1 text-xs"
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mr-3 text-xs font-medium text-brand-deep underline"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      disabled={busyId === post.id}
                      onClick={() => void onDelete(post)}
                      className="text-xs font-medium text-red-600 disabled:opacity-50"
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
