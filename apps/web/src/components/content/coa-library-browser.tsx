'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, ExternalLink, FileText, Search } from 'lucide-react';
import type { DocumentSearchResult } from '@mcpfac/shared-types';
import { Input } from '@/components/ui';
import { searchDocuments } from '@/lib/documents-api';

/**
 * Browse-all COA library — loads approved PUBLIC certificates and filters client-side.
 */
export function CoaLibraryBrowser() {
  const [docs, setDocs] = useState<DocumentSearchResult[]>([]);
  const [filter, setFilter] = useState('');
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPending(true);
      setError(null);
      try {
        const results = await searchDocuments({ type: 'COA', limit: 50 });
        if (!cancelled) setDocs(results);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load certificates');
          setDocs([]);
        }
      } finally {
        if (!cancelled) setPending(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((doc) => {
      const haystack = [
        doc.title,
        doc.fileName,
        doc.description ?? '',
        ...doc.products.flatMap((p) => [p.name, p.sku, p.slug]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [docs, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
            Published certificates
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
            All COAs
          </h2>
          <p className="mt-2 max-w-xl text-sm text-neutral-600 sm:text-base">
            Browse every published Certificate of Analysis. Open the PDF or jump to the linked
            product page.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <Input
            id="coa-library-filter"
            name="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by product or SKU…"
            className="pl-9"
            aria-label="Filter certificates"
          />
        </div>
      </div>

      {pending ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="h-36 animate-pulse rounded-xl bg-neutral-100 ring-1 ring-neutral-200/80"
            />
          ))}
        </ul>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!pending && !error && filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-neutral-400" aria-hidden />
          <p className="mt-3 font-heading text-base font-semibold text-brand-deep">
            {docs.length === 0 ? 'No certificates published yet' : 'No matches for that filter'}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {docs.length === 0
              ? 'Use batch lookup below to request a lot packet by email.'
              : 'Try a different product name or SKU.'}
          </p>
        </div>
      ) : null}

      {!pending && filtered.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => {
            const primary = doc.products[0];
            return (
              <li
                key={doc.id}
                className="flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/80 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-deep">
                    <FileText className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold text-brand-deep sm:text-base">
                      {doc.title}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      COA · v{doc.version}
                      {primary ? ` · ${primary.sku}` : ''}
                    </p>
                  </div>
                </div>

                {primary ? (
                  <p className="mt-3 truncate text-sm text-neutral-600">{primary.name}</p>
                ) : null}
                {doc.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{doc.description}</p>
                ) : !primary ? (
                  <p className="mt-3 text-sm text-neutral-400">Unlinked certificate</p>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep hover:text-brand-natural"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    View PDF
                  </a>
                  {primary ? (
                    <Link
                      href={`/products/${primary.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-brand-deep"
                    >
                      Product
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {!pending && docs.length > 0 ? (
        <p className="text-xs text-neutral-500">
          Showing {filtered.length} of {docs.length} published certificate
          {docs.length === 1 ? '' : 's'}.
        </p>
      ) : null}
    </div>
  );
}
