'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import type { ProductSummary } from '@mcpfac/shared-types';
import { suggestProducts } from '@/lib/catalog-api';

export function ProductSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const suggestions = await suggestProducts(query.trim(), 8);
        setResults(suggestions);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setOpen(false);
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-brand-deep"
        aria-label="Search products"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,420px)] rounded-xl border border-neutral-200 bg-white p-4 shadow-xl">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, SKU, CAS..."
              className="w-full rounded-lg border border-neutral-300 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          <div className="mt-3 max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-6 text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}

            {!isLoading && query.trim().length >= 2 && results.length === 0 && (
              <p className="px-2 py-4 text-sm text-neutral-500">No matching products found.</p>
            )}

            {!isLoading && results.length > 0 && (
              <ul className="space-y-1">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 transition-colors hover:bg-brand-pale/50"
                    >
                      <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                      <p className="text-xs text-neutral-500">
                        {product.sku}
                        {product.casNumber ? ` · CAS ${product.casNumber}` : ''}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {query.trim().length >= 2 && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/products?search=${encodeURIComponent(query.trim())}`);
                }}
                className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-brand-deep transition-colors hover:bg-neutral-50"
              >
                View all results for &quot;{query.trim()}&quot;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
