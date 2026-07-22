'use client';

import { useEffect, useState } from 'react';
import type { AdminFaqCategory, AdminFaqQuestion } from '@mcpfac/shared-types';
import {
  createAdminFaqCategory,
  createAdminFaqQuestion,
  deleteAdminFaqQuestion,
  listAdminFaqCategories,
  listAdminFaqQuestions,
  updateAdminFaqQuestion,
} from '@/lib/admin-api';
import { AdminTableSkeleton } from '@/components/admin/admin-table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CircleHelp } from 'lucide-react';

export default function AdminFaqPage() {
  const [categories, setCategories] = useState<AdminFaqCategory[]>([]);
  const [items, setItems] = useState<AdminFaqQuestion[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();

  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [cats, questions] = await Promise.all([
        listAdminFaqCategories(),
        listAdminFaqQuestions({ page: 1, limit: 200, search: search || undefined }),
      ]);
      setCategories(cats);
      setItems(questions.items);
      if (!categoryId && cats[0]) setCategoryId(cats[0].id);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreateCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryName.trim()) return;
    try {
      const created = await createAdminFaqCategory({ name: categoryName.trim() });
      setCategoryName('');
      setCategoryId(created.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Category create failed');
    }
  }

  async function onCreateQuestion(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryId || !question.trim() || !answer.trim()) return;
    try {
      await createAdminFaqQuestion({
        categoryId,
        question: question.trim(),
        answer: answer.trim(),
        sortOrder: items.length,
      });
      setQuestion('');
      setAnswer('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Question create failed');
    }
  }

  async function onToggleVisible(item: AdminFaqQuestion) {
    setBusyId(item.id);
    try {
      await updateAdminFaqQuestion(item.id, { isVisible: !item.isVisible });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(undefined);
    }
  }

  async function onDelete(item: AdminFaqQuestion) {
    if (!window.confirm(`Delete “${item.question.slice(0, 80)}”?`)) return;
    setBusyId(item.id);
    try {
      await deleteAdminFaqQuestion(item.id);
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
        <h1 className="font-heading text-3xl font-bold text-brand-deep">FAQ</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Manage storefront FAQ questions. Visible items appear on `/faq` and the homepage teaser.
        </p>
      </div>

      <form
        onSubmit={onCreateCategory}
        className="flex flex-wrap gap-3 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <input
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="New category name"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white">
          Add category
        </button>
      </form>

      <form
        onSubmit={onCreateQuestion}
        className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          required
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.questionCount})
            </option>
          ))}
        </select>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          required
        />
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer"
          rows={4}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          className="justify-self-start rounded-lg bg-brand-deep px-4 py-2 text-sm font-medium text-white"
        >
          Add question
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
          placeholder="Search questions…"
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
          icon={CircleHelp}
          title="No FAQ questions"
          description="Add a category and question above, or run pnpm db:seed."
          className="py-10 shadow-none"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{item.question}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{item.answer}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">{item.categoryName}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void onToggleVisible(item)}
                      className="rounded border border-neutral-200 px-2 py-1 text-xs disabled:opacity-50"
                    >
                      {item.isVisible ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void onDelete(item)}
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
