'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DocumentSearchResult } from '@mcpfac/shared-types';
import { Button, Input, Label } from '@/components/ui';
import { searchDocuments } from '@/lib/documents-api';

/**
 * COA library search — queries approved PUBLIC documents.
 * Falls back to mailto when nothing matches or API is unavailable.
 */
export function CoaBatchLookup() {
  const [sku, setSku] = useState('');
  const [batch, setBatch] = useState('');
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<DocumentSearchResult[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openMailto() {
    const subject = encodeURIComponent(
      `COA request — ${sku.trim() || 'SKU TBD'}${batch.trim() ? ` / batch ${batch.trim()}` : ''}`,
    );
    const body = encodeURIComponent(
      [
        'Please send the Certificate of Analysis (and HPLC if available) for:',
        '',
        `SKU / product: ${sku.trim() || '(not provided)'}`,
        `Batch / lot: ${batch.trim() || '(not provided)'}`,
        `Reply email: ${email.trim() || '(not provided)'}`,
        '',
        'Organization / lab:',
        'Notes:',
      ].join('\n'),
    );
    window.location.href = `mailto:info@mcpfacbiotech.site?subject=${subject}&body=${body}`;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setResults(null);

    try {
      const docs = await searchDocuments({
        q: sku.trim(),
        type: 'COA',
        limit: 12,
      });
      // Also surface HPLC when searching by the same query
      const hplc = await searchDocuments({
        q: sku.trim(),
        type: 'HPLC',
        limit: 8,
      });
      const merged = [...docs, ...hplc.filter((d) => !docs.some((c) => c.id === d.id))];
      setResults(merged);
      if (merged.length === 0) {
        // No published packet — offer mailto path
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200/80 sm:p-7">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="font-heading text-lg font-semibold text-brand-deep">Batch lookup</p>
          <p className="mt-1 text-sm text-neutral-500">
            Search published COA / HPLC packets by SKU or product name. Request by email if nothing
            is listed.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="coa-sku" isRequired>
            Product SKU or name
          </Label>
          <Input
            id="coa-sku"
            name="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. BPC-157 or SKU-…"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coa-batch">Batch / lot number</Label>
          <Input
            id="coa-batch"
            name="batch"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            placeholder="From vial label or packing slip"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coa-email">Your email</Label>
          <Input
            id="coa-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@lab.org"
          />
        </div>
        <Button type="submit" fullWidth isLoading={pending}>
          Search documents
        </Button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {results !== null ? (
        <div className="space-y-3 border-t border-neutral-100 pt-4">
          {results.length > 0 ? (
            <ul className="space-y-3">
              {results.map((doc) => (
                <li
                  key={doc.id}
                  className="rounded-lg border border-neutral-200 bg-neutral-50/80 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-brand-deep">{doc.title}</p>
                      <p className="text-xs text-neutral-500">
                        {doc.type} · v{doc.version}
                        {doc.products[0] ? ` · ${doc.products[0].sku}` : ''}
                      </p>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-brand-deep underline"
                    >
                      Open
                    </a>
                  </div>
                  {doc.products[0] ? (
                    <Link
                      href={`/products/${doc.products[0].slug}`}
                      className="mt-2 inline-block text-xs text-neutral-600 hover:text-brand-deep"
                    >
                      View product →
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-600">
              No published COA/HPLC matched that query. You can still request a packet by email.
            </p>
          )}
          <Button type="button" variant="outline" fullWidth onClick={openMailto}>
            Request by email
          </Button>
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-neutral-500">
        For published lots, also check the product page documentation section.
      </p>
    </div>
  );
}
